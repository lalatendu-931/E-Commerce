"""
Order and cart related database models.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    Column, String, DateTime, Text, Integer, 
    Numeric, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class OrderStatus(str, Enum):
    """Order status flow."""
    PENDING = "pending"              # Order placed, awaiting action
    RESERVED = "reserved"            # Items reserved for pickup
    CONFIRMED = "confirmed"          # Confirmed by store
    READY_FOR_PICKUP = "ready"       # Ready for customer pickup
    COMPLETED = "completed"          # Order fulfilled
    CANCELLED = "cancelled"          # Order cancelled


class PurchaseMode(str, Enum):
    """How customer wants to purchase."""
    PAY_ONLINE = "pay-online"        # Pay now, pickup later
    RESERVE_PICKUP = "reserve-pickup" # Reserve, pay at store


class PaymentStatus(str, Enum):
    """Payment status."""
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"


class Order(Base):
    """Order model for tracking purchases."""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Order type
    purchase_mode = Column(SQLEnum(PurchaseMode), nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    
    # Customer info (for guest orders or different delivery address)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    customer_email = Column(String(255), nullable=True)
    
    # Pricing
    subtotal = Column(Numeric(10, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(10, 2), nullable=False)
    
    # Payment
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(String(50), nullable=True)  # cash, upi, card
    payment_reference = Column(String(255), nullable=True)
    
    # Pickup details
    expected_pickup_date = Column(DateTime, nullable=True)
    actual_pickup_date = Column(DateTime, nullable=True)
    
    # Notes
    customer_notes = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)  # Internal notes
    
    # Extra data
    extra_data = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Order {self.order_number}>"


class OrderItem(Base):
    """Individual items within an order."""
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Product snapshot (in case product changes later)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=True)
    
    # Pricing at time of order
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Notes
    notes = Column(Text, nullable=True)  # Special instructions
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    
    def __repr__(self) -> str:
        return f"<OrderItem {self.product_name} x{self.quantity}>"
