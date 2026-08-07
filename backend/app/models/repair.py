"""
Repair inquiry related database models.
"""
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Column, String, DateTime, Text, 
    Numeric, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class RepairStatus(str, Enum):
    """Repair inquiry status flow."""
    INQUIRY_RECEIVED = "inquiry_received"  # Initial submission
    UNDER_REVIEW = "under_review"          # Staff reviewing
    APPROVED = "approved"                   # Can be repaired, visit scheduled
    REJECTED = "rejected"                   # Cannot be repaired
    IN_PROGRESS = "in_progress"             # Repair started
    WAITING_PARTS = "waiting_parts"         # Waiting for spare parts
    COMPLETED = "completed"                 # Repair done
    DELIVERED = "delivered"                 # Customer picked up
    CANCELLED = "cancelled"                 # Cancelled


class ApplianceType(str, Enum):
    """Types of appliances we repair."""
    CEILING_FAN = "ceiling_fan"
    TABLE_FAN = "table_fan"
    PEDESTAL_FAN = "pedestal_fan"
    WALL_FAN = "wall_fan"
    EXHAUST_FAN = "exhaust_fan"
    MIXER_GRINDER = "mixer_grinder"
    WET_GRINDER = "wet_grinder"
    IRON = "iron"
    INDUCTION_COOKTOP = "induction_cooktop"
    MOTOR = "motor"
    OTHER = "other"


class RepairInquiry(Base):
    """Repair service inquiry model."""
    __tablename__ = "repair_inquiries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inquiry_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Can be guest
    
    # Status
    status = Column(SQLEnum(RepairStatus), default=RepairStatus.INQUIRY_RECEIVED, nullable=False)
    
    # Customer info
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=False)
    customer_email = Column(String(255), nullable=True)
    
    # Appliance details
    appliance_type = Column(SQLEnum(ApplianceType), nullable=False)
    appliance_brand = Column(String(100), nullable=True)
    appliance_model = Column(String(100), nullable=True)
    
    # Problem description
    problem_description = Column(Text, nullable=False)
    problem_images = Column(JSON, default=list)  # URLs of uploaded images
    
    # Visit scheduling
    preferred_visit_date = Column(DateTime, nullable=False)
    preferred_time_slot = Column(String(50), nullable=True)  # morning, afternoon, evening
    actual_visit_date = Column(DateTime, nullable=True)
    
    # Store response
    diagnosis = Column(Text, nullable=True)
    estimated_cost_min = Column(Numeric(10, 2), nullable=True)
    estimated_cost_max = Column(Numeric(10, 2), nullable=True)
    estimated_duration = Column(String(50), nullable=True)  # "Same Day", "2-3 Days"
    rejection_reason = Column(Text, nullable=True)
    
    # Final details
    final_cost = Column(Numeric(10, 2), nullable=True)
    parts_used = Column(JSON, default=list)  # List of parts used
    repair_notes = Column(Text, nullable=True)
    
    # Notes
    customer_notes = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    reviewed_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="repair_inquiries")
    
    def __repr__(self) -> str:
        return f"<RepairInquiry {self.inquiry_number}>"
