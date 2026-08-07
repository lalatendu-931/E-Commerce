"""
Product and inventory related database models.
"""
import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import List

from sqlalchemy import (
    Column, String, DateTime, Boolean, Text, Integer, 
    Numeric, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base


class ProductCategory(str, Enum):
    """Product category types."""
    FANS = "fans"
    KITCHEN = "kitchen"
    IRONS = "irons"
    SPARE_PARTS = "spare-parts"
    MOTORS = "motors"
    ELECTRICAL = "electrical"


class ProductStatus(str, Enum):
    """Product availability status."""
    ACTIVE = "active"
    OUT_OF_STOCK = "out_of_stock"
    PRE_BOOKABLE = "pre_bookable"
    DISCONTINUED = "discontinued"


class Category(Base):
    """Product categories."""
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)  # Emoji or icon name
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    products = relationship("Product", back_populates="category", lazy="dynamic")
    
    def __repr__(self) -> str:
        return f"<Category {self.name}>"


class Product(Base):
    """Product model for inventory management."""
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(100), unique=True, nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(300), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Categorization
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    brand = Column(String(100), nullable=True, index=True)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=True)  # For showing discounts
    bargain_available = Column(Boolean, default=True)  # Price negotiable at store
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)  # Reserved for pickup
    low_stock_threshold = Column(Integer, default=5)
    
    # Status
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    
    # Media
    image_url = Column(String(500), nullable=True)
    images = Column(JSON, default=list)  # List of image URLs
    
    # Attributes
    specifications = Column(JSON, default=dict)  # Technical specs
    tags = Column(ARRAY(String), default=list)  # Search tags
    
    # Ratings
    rating = Column(Numeric(2, 1), default=0)
    review_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product", lazy="dynamic")
    pre_booking_items = relationship(
        "PreBookingItem", 
        back_populates="product", 
        lazy="dynamic",
        foreign_keys="PreBookingItem.product_id"
    )
    
    @property
    def available_quantity(self) -> int:
        """Quantity available for purchase (excluding reserved)."""
        return max(0, self.stock_quantity - self.reserved_quantity)
    
    @property
    def in_stock(self) -> bool:
        """Check if product is in stock."""
        return self.available_quantity > 0
    
    @property
    def discount_percentage(self) -> int:
        """Calculate discount percentage if original price exists."""
        if self.original_price and self.original_price > self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0
    
    def __repr__(self) -> str:
        return f"<Product {self.name}>"
