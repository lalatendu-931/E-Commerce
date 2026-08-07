"""
User and authentication related database models.
"""
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column, String, DateTime, Boolean, Text, Enum as SQLEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class UserRole(str, Enum):
    """User roles for authorization."""
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"


class User(Base):
    """
    User model for storing customer and staff information.
    Authentication is handled by Supabase - this stores profile data.
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supabase_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    
    # Profile information
    name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    
    # Role and status
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Auth provider info
    auth_provider = Column(String(50), default="email")  # email, google
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    orders = relationship("Order", back_populates="user", lazy="dynamic")
    pre_bookings = relationship("PreBooking", back_populates="user", lazy="dynamic")
    repair_inquiries = relationship("RepairInquiry", back_populates="user", lazy="dynamic")
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
