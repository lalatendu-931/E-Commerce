"""
User profile API routes.
Handles user profile management and history views.
"""
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, CurrentUser, CurrentAdminUser
from app.models.user import User, UserRole
from app.models.order import Order
from app.models.prebooking import PreBooking
from app.models.repair import RepairInquiry
from app.schemas.user import UserUpdate, UserResponse, UserRoleUpdate
from app.schemas.order import OrderSummary
from app.schemas.prebooking import PreBookingSummary
from app.schemas.repair import RepairInquirySummary
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/users", tags=["Users"])
logger = get_logger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: CurrentUser):
    """
    Get current user's profile.
    """
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    updates: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
):
    """
    Update current user's profile.
    """
    try:
        # Update fields
        update_data = updates.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_user, field, value)
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Profile updated for user: {current_user.email}")
        return current_user
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )


@router.get("/me/orders", response_model=List[OrderSummary])
async def get_my_orders(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Get current user's order history.
    """
    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    orders = result.scalars().all()
    
    return [
        OrderSummary(
            id=order.id,
            order_number=order.order_number,
            status=order.status,
            total_amount=order.total_amount,
            item_count=len(order.items),
            created_at=order.created_at,
        )
        for order in orders
    ]


@router.get("/me/pre-bookings", response_model=List[PreBookingSummary])
async def get_my_pre_bookings(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Get current user's pre-booking history.
    """
    result = await db.execute(
        select(PreBooking)
        .where(PreBooking.user_id == current_user.id)
        .order_by(PreBooking.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    bookings = result.scalars().all()
    
    return [
        PreBookingSummary(
            id=booking.id,
            booking_number=booking.booking_number,
            status=booking.status,
            expected_visit_date=booking.expected_visit_date,
            item_count=len(booking.items),
            created_at=booking.created_at,
        )
        for booking in bookings
    ]


@router.get("/me/repair-inquiries", response_model=List[RepairInquirySummary])
async def get_my_repair_inquiries(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
):
    """
    Get current user's repair inquiry history.
    """
    result = await db.execute(
        select(RepairInquiry)
        .where(RepairInquiry.user_id == current_user.id)
        .order_by(RepairInquiry.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    inquiries = result.scalars().all()
    
    return [
        RepairInquirySummary(
            id=inquiry.id,
            inquiry_number=inquiry.inquiry_number,
            status=inquiry.status,
            appliance_type=inquiry.appliance_type,
            preferred_visit_date=inquiry.preferred_visit_date,
            created_at=inquiry.created_at,
        )
        for inquiry in inquiries
    ]


# ============ Admin Routes ============

@router.get("/", response_model=List[UserResponse])
async def list_users(
    admin_user: CurrentAdminUser,
    db: DbSession,
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    List all users (admin only).
    """
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.name.ilike(f"%{search}%")) |
            (User.phone.ilike(f"%{search}%"))
        )
    
    query = query.order_by(User.created_at.desc()).limit(limit).offset(offset)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin_user: CurrentAdminUser,
    db: DbSession,
):
    """
    Get a specific user by ID (admin only).
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    admin_user: CurrentAdminUser,
    db: DbSession,
):
    """
    Update a user's role (admin only).
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent self-demotion
    if user.id == admin_user.id and role_update.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself",
        )
    
    user.role = role_update.role
    await db.commit()
    await db.refresh(user)
    
    logger.info(f"User role updated: {user.email} -> {role_update.role}")
    return user


@router.patch("/{user_id}/deactivate", response_model=ResponseMessage)
async def deactivate_user(
    user_id: str,
    admin_user: CurrentAdminUser,
    db: DbSession,
):
    """
    Deactivate a user account (admin only).
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    # Prevent self-deactivation
    if user.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself",
        )
    
    user.is_active = False
    await db.commit()
    
    logger.info(f"User deactivated: {user.email}")
    return ResponseMessage(message="User deactivated successfully")


@router.patch("/{user_id}/activate", response_model=ResponseMessage)
async def activate_user(
    user_id: str,
    admin_user: CurrentAdminUser,
    db: DbSession,
):
    """
    Activate a user account (admin only).
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user.is_active = True
    await db.commit()
    
    logger.info(f"User activated: {user.email}")
    return ResponseMessage(message="User activated successfully")
