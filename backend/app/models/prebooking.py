"""
Pre-booking related database models.
"""
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column, String, DateTime, Text, Integer, 
    Numeric, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class PreBookingStatus(str, Enum):
    """Pre-booking status flow."""
    PENDING = "pending"              # Submitted, awaiting store response
    AVAILABLE = "available"          # All items available
    PARTIAL = "partial"              # Some items available
    NOT_AVAILABLE = "not_available"  # Items not available
    CONFIRMED = "confirmed"          # Customer confirmed, items reserved
    COMPLETED = "completed"          # Customer picked up
    CANCELLED = "cancelled"          # Cancelled by customer or store
    EXPIRED = "expired"              # Visit date passed without action


class PreBooking(Base):
    """Pre-booking request for items."""
    __tablename__ = "pre_bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Status
    status = Column(SQLEnum(PreBookingStatus), default=PreBookingStatus.PENDING, nullable=False)
    
    # Customer info
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(255), nullable=True)
    
    # Visit details
    expected_visit_date = Column(DateTime, nullable=False)
    preferred_time_slot = Column(String(50), nullable=True)  # morning, afternoon, evening
    
    # Store response
    store_response = Column(Text, nullable=True)
    alternatives_offered = Column(JSON, default=list)  # Alternative products if unavailable
    
    # Notes
    customer_notes = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="pre_bookings")
    items = relationship("PreBookingItem", back_populates="pre_booking", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<PreBooking {self.booking_number}>"


class PreBookingItem(Base):
    """Individual items within a pre-booking."""
    __tablename__ = "pre_booking_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pre_booking_id = Column(UUID(as_uuid=True), ForeignKey("pre_bookings.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Product snapshot
    product_name = Column(String(255), nullable=False)
    
    # Quantity
    quantity = Column(Integer, nullable=False, default=1)
    
    # Availability response from store
    is_available = Column(String(20), default="pending")  # pending, yes, no, partial
    available_quantity = Column(Integer, nullable=True)
    
    # Alternative product suggestion
    alternative_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    alternative_notes = Column(Text, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    pre_booking = relationship("PreBooking", back_populates="items")
    product = relationship("Product", back_populates="pre_booking_items", foreign_keys=[product_id])
    
    def __repr__(self) -> str:
        return f"<PreBookingItem {self.product_name} x{self.quantity}>"
