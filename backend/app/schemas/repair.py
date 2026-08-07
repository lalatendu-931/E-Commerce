"""
Pydantic schemas for repair inquiry data validation.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, EmailStr

from app.models.repair import RepairStatus, ApplianceType


# ============ Repair Inquiry Schemas ============

class RepairInquiryCreate(BaseModel):
    """Schema for creating a repair inquiry."""
    # Customer info
    customer_name: str = Field(..., max_length=255)
    customer_phone: str = Field(..., max_length=20)
    customer_email: Optional[EmailStr] = None
    
    # Appliance details
    appliance_type: ApplianceType
    appliance_brand: Optional[str] = Field(None, max_length=100)
    appliance_model: Optional[str] = Field(None, max_length=100)
    
    # Problem
    problem_description: str = Field(..., min_length=10, max_length=2000)
    problem_images: List[str] = []  # URLs of uploaded images
    
    # Visit scheduling
    preferred_visit_date: datetime
    preferred_time_slot: Optional[str] = Field(
        None, 
        pattern="^(morning|afternoon|evening)$"
    )
    
    # Notes
    customer_notes: Optional[str] = None


class RepairInquiryUpdate(BaseModel):
    """Schema for customer updating repair inquiry."""
    preferred_visit_date: Optional[datetime] = None
    preferred_time_slot: Optional[str] = Field(
        None, 
        pattern="^(morning|afternoon|evening)$"
    )
    problem_description: Optional[str] = Field(None, min_length=10, max_length=2000)
    problem_images: Optional[List[str]] = None
    customer_notes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class RepairStaffUpdate(BaseModel):
    """Schema for staff updating repair inquiry."""
    status: Optional[RepairStatus] = None
    diagnosis: Optional[str] = None
    estimated_cost_min: Optional[Decimal] = Field(None, ge=0)
    estimated_cost_max: Optional[Decimal] = Field(None, ge=0)
    estimated_duration: Optional[str] = None
    rejection_reason: Optional[str] = None
    actual_visit_date: Optional[datetime] = None
    final_cost: Optional[Decimal] = Field(None, ge=0)
    parts_used: Optional[List[dict]] = None
    repair_notes: Optional[str] = None
    staff_notes: Optional[str] = None


class RepairInquiryResponse(BaseModel):
    """Schema for repair inquiry response."""
    id: UUID
    inquiry_number: str
    user_id: Optional[UUID] = None
    status: RepairStatus
    
    # Customer info
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    
    # Appliance details
    appliance_type: ApplianceType
    appliance_brand: Optional[str] = None
    appliance_model: Optional[str] = None
    
    # Problem
    problem_description: str
    problem_images: List[str] = []
    
    # Visit scheduling
    preferred_visit_date: datetime
    preferred_time_slot: Optional[str] = None
    actual_visit_date: Optional[datetime] = None
    
    # Store response
    diagnosis: Optional[str] = None
    estimated_cost_min: Optional[Decimal] = None
    estimated_cost_max: Optional[Decimal] = None
    estimated_duration: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Final details
    final_cost: Optional[Decimal] = None
    parts_used: List[dict] = []
    repair_notes: Optional[str] = None
    
    # Notes
    customer_notes: Optional[str] = None
    staff_notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class RepairInquiryListResponse(BaseModel):
    """Schema for paginated repair inquiry list."""
    items: List[RepairInquiryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class RepairInquirySummary(BaseModel):
    """Brief repair inquiry summary for lists."""
    id: UUID
    inquiry_number: str
    status: RepairStatus
    appliance_type: ApplianceType
    preferred_visit_date: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Repair Service Info Schemas ============

class RepairServiceInfo(BaseModel):
    """Information about a repair service we offer."""
    id: int
    name: str
    price_range: str
    description: str
    estimated_time: str
    includes: List[str]


class NotRepairedItemsResponse(BaseModel):
    """List of items we don't repair."""
    items: List[str]
    notice: str
