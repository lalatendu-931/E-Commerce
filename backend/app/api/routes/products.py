"""
Product and category API routes.
Handles product catalog, categories, and inventory management.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.api.deps import DbSession, CurrentUserOptional, CurrentStaffUser
from app.models.product import Product, Category, ProductStatus
from app.schemas.product import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    ProductCreate,
    ProductUpdate,
    InventoryUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/products", tags=["Products"])
logger = get_logger(__name__)


# ============ Category Routes ============

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(
    db: DbSession,
    include_inactive: bool = False,
):
    """
    List all product categories.
    """
    query = select(Category)
    
    if not include_inactive:
        query = query.where(Category.is_active == True)
    
    query = query.order_by(Category.display_order)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    # Add product count to each category
    response = []
    for cat in categories:
        count_result = await db.execute(
            select(func.count(Product.id))
            .where(Product.category_id == cat.id)
            .where(Product.status != ProductStatus.DISCONTINUED)
        )
        product_count = count_result.scalar()
        
        cat_response = CategoryResponse.model_validate(cat)
        cat_response.product_count = product_count
        response.append(cat_response)
    
    return response


@router.get("/categories/{slug}", response_model=CategoryResponse)
async def get_category(
    slug: str,
    db: DbSession,
):
    """
    Get a category by slug.
    """
    result = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    return category


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Create a new category (staff only).
    """
    # Check if slug already exists
    existing = await db.execute(
        select(Category).where(Category.slug == category_data.slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists",
        )
    
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    logger.info(f"Category created: {category.name}")
    return category


@router.patch("/categories/{slug}", response_model=CategoryResponse)
async def update_category(
    slug: str,
    updates: CategoryUpdate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Update a category (staff only).
    """
    result = await db.execute(
        select(Category).where(Category.slug == slug)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    
    logger.info(f"Category updated: {category.name}")
    return category


# ============ Product Routes ============

@router.get("/", response_model=ProductListResponse)
async def list_products(
    db: DbSession,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    featured_only: bool = False,
    bestseller_only: bool = False,
    status: Optional[ProductStatus] = None,
    sort_by: str = Query(default="created_at", pattern="^(name|price|rating|created_at)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    """
    List products with filters and pagination.
    """
    query = select(Product).options(selectinload(Product.category))
    
    # Apply filters
    if category:
        query = query.join(Category).where(Category.slug == category)
    
    if brand:
        query = query.where(Product.brand.ilike(f"%{brand}%"))
    
    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.brand.ilike(f"%{search}%"),
            )
        )
    
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    
    if in_stock_only:
        query = query.where(
            (Product.stock_quantity - Product.reserved_quantity) > 0
        )
    
    if featured_only:
        query = query.where(Product.is_featured == True)
    
    if bestseller_only:
        query = query.where(Product.is_bestseller == True)
    
    if status:
        query = query.where(Product.status == status)
    else:
        # By default, exclude discontinued products
        query = query.where(Product.status != ProductStatus.DISCONTINUED)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply sorting
    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.limit(page_size).offset(offset)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Build response with category names
    items = []
    for product in products:
        product_response = ProductResponse.model_validate(product)
        product_response.category_name = product.category.name if product.category else None
        items.append(product_response)
    
    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(
    slug: str,
    db: DbSession,
):
    """
    Get a product by slug.
    """
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    response = ProductResponse.model_validate(product)
    response.category_name = product.category.name if product.category else None
    return response


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Create a new product (staff only).
    """
    # Check if slug already exists
    existing = await db.execute(
        select(Product).where(Product.slug == product_data.slug)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists",
        )
    
    # Verify category exists
    cat_result = await db.execute(
        select(Category).where(Category.id == product_data.category_id)
    )
    if not cat_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found",
        )
    
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    logger.info(f"Product created: {product.name}")
    return product


@router.patch("/{slug}", response_model=ProductResponse)
async def update_product(
    slug: str,
    updates: ProductUpdate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Update a product (staff only).
    """
    result = await db.execute(
        select(Product).where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    update_data = updates.model_dump(exclude_unset=True)
    
    # If updating category, verify it exists
    if "category_id" in update_data:
        cat_result = await db.execute(
            select(Category).where(Category.id == update_data["category_id"])
        )
        if not cat_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found",
            )
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    logger.info(f"Product updated: {product.name}")
    return product


@router.patch("/{slug}/inventory", response_model=ProductResponse)
async def update_inventory(
    slug: str,
    inventory: InventoryUpdate,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Update product inventory (staff only).
    """
    result = await db.execute(
        select(Product).where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    if inventory.action == "add" and inventory.stock_quantity:
        product.stock_quantity += inventory.stock_quantity
    elif inventory.action == "subtract" and inventory.stock_quantity:
        product.stock_quantity = max(0, product.stock_quantity - inventory.stock_quantity)
    elif inventory.action == "set" and inventory.stock_quantity is not None:
        product.stock_quantity = inventory.stock_quantity
    
    if inventory.reserved_quantity is not None:
        product.reserved_quantity = inventory.reserved_quantity
    
    # Update status based on stock
    if product.stock_quantity == 0:
        product.status = ProductStatus.OUT_OF_STOCK
    elif product.status == ProductStatus.OUT_OF_STOCK and product.stock_quantity > 0:
        product.status = ProductStatus.ACTIVE
    
    await db.commit()
    await db.refresh(product)
    
    logger.info(f"Inventory updated for: {product.name}")
    return product


@router.delete("/{slug}", response_model=ResponseMessage)
async def delete_product(
    slug: str,
    staff_user: CurrentStaffUser,
    db: DbSession,
):
    """
    Delete a product (soft delete - marks as discontinued).
    """
    result = await db.execute(
        select(Product).where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    
    product.status = ProductStatus.DISCONTINUED
    await db.commit()
    
    logger.info(f"Product discontinued: {product.name}")
    return ResponseMessage(message="Product discontinued successfully")
