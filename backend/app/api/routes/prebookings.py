"""
Pre-booking API routes.
Handles pre-booking requests and store responses.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, CurrentUser, CurrentStaffUser
from app.models.prebooking import PreBooking, PreBookingItem, PreBookingStatus
from app.models.product import Product, ProductStatus
from app.schemas.prebooking import (
    PreBookingCreate,
    PreBookingUpdate,
    PreBookingStoreResponse,
    PreBookingResponse,
    PreBookingListResponse,
)
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/pre-bookings", tags=["Pre-Bookings"])
logger = get_logger(__name__)


def generate_booking_number() -> str:
    """Generate a unique booking number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()
    return f"PB-{timestamp}-{random_part}"


@router.post("/", response_model=PreBookingResponse, status_code=status.HTTP_201_CREATED)
async def create_pre_booking(
    booking_data: PreBookingCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Create a new pre-booking request.
    """
    # Validate items
    items = []
    for item_data in booking_data.items:
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
        
        # Create booking item
        booking_item = PreBookingItem(
            product_id=product.id,
            product_name=product.name,
            quantity=item_data.quantity,
            is_available="pending",
            notes=item_data.notes,
        )
        items.append(booking_item)
    
    # Create pre-booking
    pre_booking = PreBooking(
        booking_number=generate_booking_number(),
        user_id=current_user.id,
        status=PreBookingStatus.PENDING,
        customer_name=booking_data.customer_name,
        customer_phone=booking_data.customer_phone,
        customer_email=booking_data.customer_email,
        expected_visit_date=booking_data.expected_visit_date,
        preferred_time_slot=booking_data.preferred_time_slot,
        customer_notes=booking_data.customer_notes,
    )
    
    pre_booking.items = items
    
    db.add(pre_booking)
    await db.commit()
    await db.refresh(pre_booking)
    
    logger.info(f"Pre-booking created: {pre_booking.booking_number}")
    
    # Load items for response
    result = await db.execute(
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.id == pre_booking.id)
    )
    pre_booking = result.scalar_one()
    
    return pre_booking


@router.get("/", response_model=PreBookingListResponse)
async def list_my_pre_bookings(
    current_user: CurrentUser,
    db: DbSession,
    status_filter: Optional[PreBookingStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
):
    """
    List current user's pre-bookings.
    """
    query = (
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.user_id == current_user.id)
    )
    
    if status_filter:
        query = query.where(PreBooking.status == status_filter)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(PreBooking.created_at.desc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return PreBookingListResponse(
        items=bookings,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{booking_number}", response_model=PreBookingResponse)
async def get_pre_booking(
    booking_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Get pre-booking details by booking number.
    """
    result = await db.execute(
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    # Only allow owner or staff to view
    if booking.user_id != current_user.id and current_user.role.value == "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    return booking


@router.patch("/{booking_number}", response_model=PreBookingResponse)
async def update_pre_booking(
    booking_number: str,
    updates: PreBookingUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Update pre-booking details.
    Only allowed for pending bookings.
    """
    result = await db.execute(
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if booking.status != PreBookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pre-booking cannot be modified in current status",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    
    await db.commit()
    await db.refresh(booking)
    
    return booking


@router.post("/{booking_number}/confirm", response_model=ResponseMessage)
async def confirm_pre_booking(
    booking_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Confirm a pre-booking after store response.
    """
    result = await db.execute(
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if booking.status not in [PreBookingStatus.AVAILABLE, PreBookingStatus.PARTIAL]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pre-booking cannot be confirmed in current status",
        )
    
    booking.status = PreBookingStatus.CONFIRMED
    booking.confirmed_at = datetime.utcnow()
    
    await db.commit()
    
    logger.info(f"Pre-booking confirmed: {booking.booking_number}")
    return ResponseMessage(message="Pre-booking confirmed successfully")


@router.post("/{booking_number}/cancel", response_model=ResponseMessage)
async def cancel_pre_booking(
    booking_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Cancel a pre-booking.
    """
    result = await db.execute(
        select(PreBooking)
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if booking.status in [PreBookingStatus.COMPLETED, PreBookingStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pre-booking cannot be cancelled in current status",
        )
    
    booking.status = PreBookingStatus.CANCELLED
    await db.commit()
    
    logger.info(f"Pre-booking cancelled: {booking.booking_number}")
    return ResponseMessage(message="Pre-booking cancelled successfully")


# ============ Staff Routes ============

@router.get("/admin/all", response_model=PreBookingListResponse)
async def list_all_pre_bookings(
    staff_user: CurrentStaffUser,
    db: DbSession,
    status_filter: Optional[PreBookingStatus] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """
    List all pre-bookings (staff only).
    """
    query = select(PreBooking).options(selectinload(PreBooking.items))
    
    if status_filter:
        query = query.where(PreBooking.status == status_filter)
    
    if search:
        query = query.where(
            (PreBooking.booking_number.ilike(f"%{search}%")) |
            (PreBooking.customer_name.ilike(f"%{search}%")) |
            (PreBooking.customer_phone.ilike(f"%{search}%"))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(PreBooking.expected_visit_date.asc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return PreBookingListResponse(
        items=bookings,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.patch("/admin/{booking_number}/respond", response_model=PreBookingResponse)
async def respond_to_pre_booking(
    booking_number: str,
    response_data: PreBookingStoreResponse,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Respond to a pre-booking (staff only).
    """
    result = await db.execute(
        select(PreBooking)
        .options(selectinload(PreBooking.items))
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    if booking.status not in [PreBookingStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pre-booking has already been responded to",
        )
    
    # Update booking
    booking.status = response_data.status
    booking.store_response = response_data.store_response
    booking.alternatives_offered = response_data.alternatives_offered
    booking.staff_notes = response_data.staff_notes
    booking.responded_at = datetime.utcnow()
    
    # Update item availability if provided
    if response_data.item_updates:
        for item_update in response_data.item_updates:
            for item in booking.items:
                if str(item.id) == item_update.get("item_id"):
                    item.is_available = item_update.get("is_available", "pending")
                    item.available_quantity = item_update.get("available_quantity")
                    item.alternative_notes = item_update.get("alternative_notes")
    
    await db.commit()
    await db.refresh(booking)
    
    logger.info(f"Pre-booking responded: {booking.booking_number} -> {response_data.status.value}")
    return booking


@router.patch("/admin/{booking_number}/complete", response_model=ResponseMessage)
async def complete_pre_booking(
    booking_number: str,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Mark a pre-booking as completed (staff only).
    """
    result = await db.execute(
        select(PreBooking)
        .where(PreBooking.booking_number == booking_number)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pre-booking not found",
        )
    
    if booking.status != PreBookingStatus.CONFIRMED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed pre-bookings can be completed",
        )
    
    booking.status = PreBookingStatus.COMPLETED
    booking.completed_at = datetime.utcnow()
    
    await db.commit()
    
    logger.info(f"Pre-booking completed: {booking.booking_number}")
    return ResponseMessage(message="Pre-booking marked as completed")
