"""
Pydantic schemas for pre-booking data validation.
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, EmailStr

from app.models.prebooking import PreBookingStatus


# ============ Pre-Booking Item Schemas ============

class PreBookingItemCreate(BaseModel):
    """Schema for creating a pre-booking item."""
    product_id: UUID
    quantity: int = Field(..., ge=1)
    notes: Optional[str] = None


class PreBookingItemUpdate(BaseModel):
    """Schema for staff updating item availability."""
    is_available: str = Field(..., pattern="^(pending|yes|no|partial)$")
    available_quantity: Optional[int] = Field(None, ge=0)
    alternative_product_id: Optional[UUID] = None
    alternative_notes: Optional[str] = None


class PreBookingItemResponse(BaseModel):
    """Schema for pre-booking item response."""
    id: UUID
    product_id: UUID
    product_name: str
    quantity: int
    is_available: str
    available_quantity: Optional[int] = None
    alternative_product_id: Optional[UUID] = None
    alternative_notes: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Pre-Booking Schemas ============

class PreBookingCreate(BaseModel):
    """Schema for creating a pre-booking."""
    items: List[PreBookingItemCreate] = Field(..., min_length=1)
    
    # Customer info
    customer_name: str = Field(..., max_length=255)
    customer_phone: str = Field(..., max_length=20)
    customer_email: Optional[EmailStr] = None
    
    # Visit details
    expected_visit_date: datetime
    preferred_time_slot: Optional[str] = Field(
        None, 
        pattern="^(morning|afternoon|evening)$"
    )
    
    # Notes
    customer_notes: Optional[str] = None


class PreBookingUpdate(BaseModel):
    """Schema for customer updating pre-booking."""
    expected_visit_date: Optional[datetime] = None
    preferred_time_slot: Optional[str] = Field(
        None, 
        pattern="^(morning|afternoon|evening)$"
    )
    customer_notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class PreBookingStoreResponse(BaseModel):
    """Schema for store responding to pre-booking."""
    status: PreBookingStatus
    store_response: Optional[str] = None
    alternatives_offered: List[dict] = []  # List of alternative suggestions
    staff_notes: Optional[str] = None
    item_updates: Optional[List[dict]] = None  # Update availability per item


class PreBookingResponse(BaseModel):
    """Schema for pre-booking response."""
    id: UUID
    booking_number: str
    user_id: UUID
    status: PreBookingStatus
    
    # Customer info
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    
    # Visit details
    expected_visit_date: datetime
    preferred_time_slot: Optional[str] = None
    
    # Store response
    store_response: Optional[str] = None
    alternatives_offered: List[dict] = []
    
    # Notes
    customer_notes: Optional[str] = None
    staff_notes: Optional[str] = None
    
    # Items
    items: List[PreBookingItemResponse] = []
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    responded_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class PreBookingListResponse(BaseModel):
    """Schema for paginated pre-booking list."""
    items: List[PreBookingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PreBookingSummary(BaseModel):
    """Brief pre-booking summary for lists."""
    id: UUID
    booking_number: str
    status: PreBookingStatus
    expected_visit_date: datetime
    item_count: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
