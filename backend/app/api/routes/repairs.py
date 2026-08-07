"""
Repair inquiry API routes.
Handles repair service inquiries and status management.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID
import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, CurrentUser, CurrentUserOptional, CurrentStaffUser
from app.models.repair import RepairInquiry, RepairStatus, ApplianceType
from app.schemas.repair import (
    RepairInquiryCreate,
    RepairInquiryUpdate,
    RepairStaffUpdate,
    RepairInquiryResponse,
    RepairInquiryListResponse,
    RepairServiceInfo,
    NotRepairedItemsResponse,
)
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/repairs", tags=["Repairs"])
logger = get_logger(__name__)


# Static data for repair services
REPAIR_SERVICES = [
    RepairServiceInfo(
        id=1,
        name="Ceiling Fan Repair",
        price_range="₹150 - ₹400",
        description="Complete ceiling fan repair including motor, capacitor, and blade issues.",
        estimated_time="Same Day - 2 Days",
        includes=["Motor repair", "Capacitor replacement", "Blade balancing", "Wiring fix"]
    ),
    RepairServiceInfo(
        id=2,
        name="Table Fan Repair",
        price_range="₹100 - ₹300",
        description="Table fan servicing and repair for all brands.",
        estimated_time="Same Day",
        includes=["Motor servicing", "Speed control fix", "Blade replacement", "Stand repair"]
    ),
    RepairServiceInfo(
        id=3,
        name="Motor Rewinding",
        price_range="₹200 - ₹800",
        description="Professional motor rewinding for fans, pumps, and small motors.",
        estimated_time="2-3 Days",
        includes=["Coil winding", "Bearing replacement", "Testing", "Warranty"]
    ),
    RepairServiceInfo(
        id=4,
        name="Mixer Grinder Repair",
        price_range="₹150 - ₹500",
        description="Mixer grinder repair including motor, jar, and blade issues.",
        estimated_time="1-2 Days",
        includes=["Motor repair", "Coupler fix", "Blade sharpening", "Jar replacement"]
    ),
    RepairServiceInfo(
        id=5,
        name="Iron Repair",
        price_range="₹100 - ₹250",
        description="Electric iron repair for dry and steam irons.",
        estimated_time="Same Day",
        includes=["Element replacement", "Thermostat fix", "Cord replacement", "Soleplate cleaning"]
    ),
    RepairServiceInfo(
        id=6,
        name="Induction Cooktop Repair",
        price_range="₹200 - ₹600",
        description="Induction cooktop repair and servicing.",
        estimated_time="1-3 Days",
        includes=["IGBT replacement", "Coil repair", "Control panel fix", "Touch pad repair"]
    ),
]

NOT_REPAIRED_ITEMS = [
    "Refrigerators",
    "Washing Machines",
    "Air Conditioners",
    "Televisions",
    "Computers/Laptops",
    "Mobile Phones",
    "Microwave Ovens",
    "Water Purifiers",
]


def generate_inquiry_number() -> str:
    """Generate a unique inquiry number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:6].upper()
    return f"RP-{timestamp}-{random_part}"


# ============ Public Routes ============

@router.get("/services", response_model=List[RepairServiceInfo])
async def get_repair_services():
    """
    Get list of repair services we offer.
    """
    return REPAIR_SERVICES


@router.get("/not-repaired", response_model=NotRepairedItemsResponse)
async def get_not_repaired_items():
    """
    Get list of items we don't repair.
    """
    return NotRepairedItemsResponse(
        items=NOT_REPAIRED_ITEMS,
        notice="We specialize in fans, motors, and small appliances. Please visit an authorized service center for the items listed above."
    )


@router.get("/appliance-types")
async def get_appliance_types():
    """
    Get list of appliance types we repair.
    """
    return [
        {"value": t.value, "label": t.value.replace("_", " ").title()}
        for t in ApplianceType
    ]


# ============ Customer Routes ============

@router.post("/", response_model=RepairInquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_repair_inquiry(
    inquiry_data: RepairInquiryCreate,
    db: DbSession,
    current_user: CurrentUserOptional = None,
):
    """
    Create a new repair inquiry.
    Can be submitted by guests or authenticated users.
    """
    inquiry = RepairInquiry(
        inquiry_number=generate_inquiry_number(),
        user_id=current_user.id if current_user else None,
        status=RepairStatus.INQUIRY_RECEIVED,
        customer_name=inquiry_data.customer_name,
        customer_phone=inquiry_data.customer_phone,
        customer_email=inquiry_data.customer_email,
        appliance_type=inquiry_data.appliance_type,
        appliance_brand=inquiry_data.appliance_brand,
        appliance_model=inquiry_data.appliance_model,
        problem_description=inquiry_data.problem_description,
        problem_images=inquiry_data.problem_images,
        preferred_visit_date=inquiry_data.preferred_visit_date,
        preferred_time_slot=inquiry_data.preferred_time_slot,
        customer_notes=inquiry_data.customer_notes,
    )
    
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    
    logger.info(f"Repair inquiry created: {inquiry.inquiry_number}")
    return inquiry


@router.get("/", response_model=RepairInquiryListResponse)
async def list_my_repair_inquiries(
    current_user: CurrentUser,
    db: DbSession,
    status_filter: Optional[RepairStatus] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=50),
):
    """
    List current user's repair inquiries.
    """
    query = select(RepairInquiry).where(RepairInquiry.user_id == current_user.id)
    
    if status_filter:
        query = query.where(RepairInquiry.status == status_filter)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(RepairInquiry.created_at.desc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    inquiries = result.scalars().all()
    
    return RepairInquiryListResponse(
        items=inquiries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{inquiry_number}", response_model=RepairInquiryResponse)
async def get_repair_inquiry(
    inquiry_number: str,
    db: DbSession,
    current_user: CurrentUserOptional = None,
):
    """
    Get repair inquiry details by inquiry number.
    Guests can view their inquiries by number, authenticated users verified by ownership.
    """
    result = await db.execute(
        select(RepairInquiry).where(RepairInquiry.inquiry_number == inquiry_number)
    )
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair inquiry not found",
        )
    
    # Check access if user is authenticated
    if current_user and inquiry.user_id:
        if inquiry.user_id != current_user.id and current_user.role.value == "customer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied",
            )
    
    return inquiry


@router.patch("/{inquiry_number}", response_model=RepairInquiryResponse)
async def update_repair_inquiry(
    inquiry_number: str,
    updates: RepairInquiryUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Update repair inquiry details.
    Only allowed for pending inquiries.
    """
    result = await db.execute(
        select(RepairInquiry).where(RepairInquiry.inquiry_number == inquiry_number)
    )
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair inquiry not found",
        )
    
    if inquiry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if inquiry.status not in [RepairStatus.INQUIRY_RECEIVED, RepairStatus.UNDER_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inquiry cannot be modified in current status",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inquiry, field, value)
    
    await db.commit()
    await db.refresh(inquiry)
    
    return inquiry


@router.post("/{inquiry_number}/cancel", response_model=ResponseMessage)
async def cancel_repair_inquiry(
    inquiry_number: str,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Cancel a repair inquiry.
    """
    result = await db.execute(
        select(RepairInquiry).where(RepairInquiry.inquiry_number == inquiry_number)
    )
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair inquiry not found",
        )
    
    if inquiry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    if inquiry.status in [RepairStatus.COMPLETED, RepairStatus.DELIVERED, RepairStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inquiry cannot be cancelled in current status",
        )
    
    inquiry.status = RepairStatus.CANCELLED
    await db.commit()
    
    logger.info(f"Repair inquiry cancelled: {inquiry.inquiry_number}")
    return ResponseMessage(message="Repair inquiry cancelled successfully")


# ============ Staff Routes ============

@router.get("/admin/all", response_model=RepairInquiryListResponse)
async def list_all_repair_inquiries(
    staff_user: CurrentStaffUser,
    db: DbSession,
    status_filter: Optional[RepairStatus] = None,
    appliance_type: Optional[ApplianceType] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """
    List all repair inquiries (staff only).
    """
    query = select(RepairInquiry)
    
    if status_filter:
        query = query.where(RepairInquiry.status == status_filter)
    
    if appliance_type:
        query = query.where(RepairInquiry.appliance_type == appliance_type)
    
    if search:
        query = query.where(
            (RepairInquiry.inquiry_number.ilike(f"%{search}%")) |
            (RepairInquiry.customer_name.ilike(f"%{search}%")) |
            (RepairInquiry.customer_phone.ilike(f"%{search}%"))
        )
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(RepairInquiry.preferred_visit_date.asc()).limit(page_size).offset(offset)
    
    result = await db.execute(query)
    inquiries = result.scalars().all()
    
    return RepairInquiryListResponse(
        items=inquiries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.patch("/admin/{inquiry_number}", response_model=RepairInquiryResponse)
async def update_repair_inquiry_status(
    inquiry_number: str,
    updates: RepairStaffUpdate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Update repair inquiry status and details (staff only).
    """
    result = await db.execute(
        select(RepairInquiry).where(RepairInquiry.inquiry_number == inquiry_number)
    )
    inquiry = result.scalar_one_or_none()
    
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repair inquiry not found",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    
    # Handle status-specific updates
    if "status" in update_data:
        new_status = update_data["status"]
        
        if new_status == RepairStatus.UNDER_REVIEW:
            inquiry.reviewed_at = datetime.utcnow()
        elif new_status == RepairStatus.APPROVED:
            inquiry.approved_at = datetime.utcnow()
        elif new_status == RepairStatus.COMPLETED:
            inquiry.completed_at = datetime.utcnow()
        elif new_status == RepairStatus.DELIVERED:
            inquiry.delivered_at = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(inquiry, field, value)
    
    await db.commit()
    await db.refresh(inquiry)
    
    logger.info(f"Repair inquiry updated: {inquiry.inquiry_number}")
    return inquiry
