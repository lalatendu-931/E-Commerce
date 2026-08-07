"""
Pydantic schemas for product-related data validation.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, computed_field

from app.models.product import ProductStatus


# ============ Category Schemas ============

class CategoryBase(BaseModel):
    """Base category schema."""
    slug: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: int = 0


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: UUID
    is_active: bool
    product_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Product Schemas ============

class ProductBase(BaseModel):
    """Base product schema."""
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    original_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    bargain_available: bool = True


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    sku: Optional[str] = Field(None, max_length=100)
    slug: str = Field(..., max_length=300)
    category_id: UUID
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    status: ProductStatus = ProductStatus.ACTIVE
    is_featured: bool = False
    is_bestseller: bool = False
    image_url: Optional[str] = None
    images: List[str] = []
    specifications: dict = {}
    tags: List[str] = []


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    category_id: Optional[UUID] = None
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    original_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    bargain_available: Optional[bool] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    status: Optional[ProductStatus] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    specifications: Optional[dict] = None
    tags: Optional[List[str]] = None
    
    model_config = ConfigDict(from_attributes=True)


class InventoryUpdate(BaseModel):
    """Schema for updating product inventory."""
    stock_quantity: Optional[int] = Field(None, ge=0)
    reserved_quantity: Optional[int] = Field(None, ge=0)
    action: Optional[str] = None  # "add", "subtract", "set"


class ProductResponse(ProductBase):
    """Schema for product response."""
    id: UUID
    sku: Optional[str] = None
    slug: str
    category_id: UUID
    category_name: Optional[str] = None
    stock_quantity: int
    reserved_quantity: int
    status: ProductStatus
    is_featured: bool
    is_bestseller: bool
    image_url: Optional[str] = None
    images: List[str] = []
    specifications: dict = {}
    tags: List[str] = []
    rating: Decimal
    review_count: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    @computed_field
    @property
    def in_stock(self) -> bool:
        """Check if product is in stock."""
        return (self.stock_quantity - self.reserved_quantity) > 0
    
    @computed_field
    @property
    def available_quantity(self) -> int:
        """Get available quantity."""
        return max(0, self.stock_quantity - self.reserved_quantity)
    
    @computed_field
    @property
    def discount_percentage(self) -> int:
        """Calculate discount percentage."""
        if self.original_price and self.original_price > self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0


class ProductListResponse(BaseModel):
    """Schema for paginated product list."""
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
