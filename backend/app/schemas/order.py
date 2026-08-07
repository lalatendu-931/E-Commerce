"""
Pydantic schemas for order-related data validation.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, EmailStr

from app.models.order import OrderStatus, PurchaseMode, PaymentStatus


# ============ Order Item Schemas ============

class OrderItemCreate(BaseModel):
    """Schema for creating an order item."""
    product_id: UUID
    quantity: int = Field(..., ge=1)
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    id: UUID
    product_id: UUID
    product_name: str
    product_sku: Optional[str] = None
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    notes: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Order Schemas ============

class OrderCreate(BaseModel):
    """Schema for creating an order."""
    purchase_mode: PurchaseMode
    items: List[OrderItemCreate] = Field(..., min_length=1)
    
    # Optional customer info (for different contact)
    customer_name: Optional[str] = Field(None, max_length=255)
    customer_phone: Optional[str] = Field(None, max_length=20)
    customer_email: Optional[EmailStr] = None
    
    # Pickup details
    expected_pickup_date: Optional[datetime] = None
    customer_notes: Optional[str] = None


class OrderUpdate(BaseModel):
    """Schema for updating an order (customer)."""
    customer_notes: Optional[str] = None
    expected_pickup_date: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status (staff/admin)."""
    status: OrderStatus
    staff_notes: Optional[str] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None


class OrderResponse(BaseModel):
    """Schema for order response."""
    id: UUID
    order_number: str
    user_id: UUID
    purchase_mode: PurchaseMode
    status: OrderStatus
    
    # Customer info
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    
    # Pricing
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    
    # Payment
    payment_status: PaymentStatus
    payment_method: Optional[str] = None
    
    # Pickup
    expected_pickup_date: Optional[datetime] = None
    actual_pickup_date: Optional[datetime] = None
    
    # Notes
    customer_notes: Optional[str] = None
    staff_notes: Optional[str] = None
    
    # Items
    items: List[OrderItemResponse] = []
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    """Schema for paginated order list."""
    items: List[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderSummary(BaseModel):
    """Brief order summary for lists."""
    id: UUID
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    item_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
