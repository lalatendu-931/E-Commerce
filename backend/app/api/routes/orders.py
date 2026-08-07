"""
Order API routes.
Handles order creation, management, and status updates.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, CurrentUser, CurrentStaffUser
from app.models.order import Order, OrderItem, OrderStatus, PurchaseMode, PaymentStatus
from app.models.product import Product, ProductStatus
from app.schemas.order import (
    OrderCreate,
    OrderUpdate,
    OrderStatusUpdate,
    OrderResponse,
    OrderListResponse,
)
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/orders", tags=["Orders"])
logger = get_logger(__name__)


def generate_order_number() -> str:
    """Generate a unique order number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()
    return f"SDE-{timestamp}-{random_part}"


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Create a new order.
    """
    # Validate items and calculate totals
    items = []
    subtotal = 0
    
    for item_data in order_data.items:
        # Get product
        result = await db.execute(
            select(Product).where(Product.id == item_data.product_id)
        )
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product not found: {item_data.product_id}",
            )
        
        if product.status == ProductStatus.DISCONTINUED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product is discontinued: {product.name}",
            )
        
        # Check availability
        available = product.stock_quantity - product.reserved_quantity
        if available < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}. Available: {available}",
            )
        
        # Calculate item total
        item_total = product.price * item_data.quantity
        subtotal += item_total
        
        # Create order item
        order_item = OrderItem(
            product_id=product.id,
            product_name=product.name,
            product_sku=product.sku,
            unit_price=product.price,
            quantity=item_data.quantity,
            total_price=item_total,
            notes=item_data.notes,
        )
        items.append(order_item)
        
        # Reserve stock
        product.reserved_quantity += item_data.quantity
    
    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        purchase_mode=order_data.purchase_mode,
        status=OrderStatus.PENDING,
        customer_name=order_data.customer_name or current_user.name,
        customer_phone=order_data.customer_phone or current_user.phone,
        customer_email=order_data.customer_email or current_user.email,
        subtotal=subtotal,
        discount_amount=0,  # Can be updated by staff
        tax_amount=0,  # Can be calculated if needed
        total_amount=subtotal,
        expected_pickup_date=order_data.expected_pickup_date,
        customer_notes=order_data.customer_notes,
    )
    
    # Add items to order
    order.items = items
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    logger.info(f"Order created: {order.order_number}")
    
    # Load items for response
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    order = result.scalar_one()
    
    return order


@router.get("/", response_model=OrderListResponse)
async def list_my_orders(
    current_user: CurrentUser,
    db: DbSession,
    status_filter: Optional[OrderStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
):
    """
    List current user's orders.
    """
    query = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
    )
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(Order.created_at.desc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{order_number}", response_model=OrderResponse)
async def get_order(
    order_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Get order details by order number.
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    # Only allow owner or staff to view
    if order.user_id != current_user.id and current_user.role.value == "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return order


@router.patch("/{order_number}", response_model=OrderResponse)
async def update_order(
    order_number: str,
    updates: OrderUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Update order details (customer notes, pickup date).
    Only allowed for pending/reserved orders.
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if order.status not in [OrderStatus.PENDING, OrderStatus.RESERVED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be modified in current status",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    await db.commit()
    await db.refresh(order)
    
    return order


@router.post("/{order_number}/cancel", response_model=ResponseMessage)
async def cancel_order(
    order_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Cancel an order.
    Only allowed for pending/reserved orders.
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if order.status not in [OrderStatus.PENDING, OrderStatus.RESERVED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order cannot be cancelled in current status",
        )
    
    # Release reserved stock
    for item in order.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product:
            product.reserved_quantity = max(0, product.reserved_quantity - item.quantity)
    
    order.status = OrderStatus.CANCELLED
    order.cancelled_at = datetime.utcnow()
    
    await db.commit()
    
    logger.info(f"Order cancelled: {order.order_number}")
    return ResponseMessage(message="Order cancelled successfully")


# ============ Staff Routes ============

@router.get("/admin/all", response_model=OrderListResponse)
async def list_all_orders(
    staff_user: CurrentStaffUser,
    db: DbSession,
    status_filter: Optional[OrderStatus] = None,
    purchase_mode: Optional[PurchaseMode] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """
    List all orders (staff only).
    """
    query = select(Order).options(selectinload(Order.items))
    
    if status_filter:
        query = query.where(Order.status == status_filter)
    
    if purchase_mode:
        query = query.where(Order.purchase_mode == purchase_mode)
    
    if search:
        query = query.where(
            (Order.order_number.ilike(f"%{search}%")) |
            (Order.customer_name.ilike(f"%{search}%")) |
            (Order.customer_phone.ilike(f"%{search}%"))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(Order.created_at.desc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.patch("/admin/{order_number}/status", response_model=OrderResponse)
async def update_order_status(
    order_number: str,
    status_update: OrderStatusUpdate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Update order status (staff only).
    """
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    # Validate status transition
    valid_transitions = {
        OrderStatus.PENDING: [OrderStatus.RESERVED, OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        OrderStatus.RESERVED: [OrderStatus.CONFIRMED, OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
        OrderStatus.CONFIRMED: [OrderStatus.READY_FOR_PICKUP, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        OrderStatus.READY_FOR_PICKUP: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        OrderStatus.COMPLETED: [],
        OrderStatus.CANCELLED: [],
    }
    
    if status_update.status not in valid_transitions.get(order.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {order.status.value} to {status_update.status.value}",
        )
    
    # Update status and timestamps
    old_status = order.status
    order.status = status_update.status
    
    if status_update.staff_notes:
        order.staff_notes = status_update.staff_notes
    
    if status_update.payment_method:
        order.payment_method = status_update.payment_method
    
    if status_update.payment_reference:
        order.payment_reference = status_update.payment_reference
    
    # Handle specific status changes
    if status_update.status == OrderStatus.CONFIRMED:
        order.confirmed_at = datetime.utcnow()
        order.payment_status = PaymentStatus.PAID
    elif status_update.status == OrderStatus.COMPLETED:
        order.completed_at = datetime.utcnow()
        order.actual_pickup_date = datetime.utcnow()
        # Reduce actual stock
        for item in order.items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            if product:
                product.stock_quantity = max(0, product.stock_quantity - item.quantity)
                product.reserved_quantity = max(0, product.reserved_quantity - item.quantity)
    elif status_update.status == OrderStatus.CANCELLED:
        order.cancelled_at = datetime.utcnow()
        # Release reserved stock
        for item in order.items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            if product:
                product.reserved_quantity = max(0, product.reserved_quantity - item.quantity)
    
    await db.commit()
    await db.refresh(order)
    
    logger.info(f"Order status updated: {order.order_number} ({old_status.value} -> {status_update.status.value})")
    return order
