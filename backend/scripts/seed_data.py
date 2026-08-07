# Seed data script for initial categories and test products

import asyncio
import uuid
from decimal import Decimal
from datetime import datetime

# Run this after setting up the database
SEED_CATEGORIES = [
    {
        "id": uuid.uuid4(),
        "slug": "fans",
        "name": "Fans & Coolers",
        "description": "Ceiling fans, table fans, exhaust fans, and air coolers",
        "icon": "🌀",
        "display_order": 1,
        "is_active": True,
    },
    {
        "id": uuid.uuid4(),
        "slug": "kitchen",
        "name": "Kitchen Appliances",
        "description": "Mixer grinders, induction cooktops, and more",
        "icon": "🍳",
        "display_order": 2,
        "is_active": True,
    },
    {
        "id": uuid.uuid4(),
        "slug": "irons",
        "name": "Irons & Steamers",
        "description": "Dry irons, steam irons, and garment steamers",
        "icon": "👔",
        "display_order": 3,
        "is_active": True,
    },
    {
        "id": uuid.uuid4(),
        "slug": "spare-parts",
        "name": "Spare Parts",
        "description": "Capacitors, motors, blades, and replacement parts",
        "icon": "⚙️",
        "display_order": 4,
        "is_active": True,
    },
    {
        "id": uuid.uuid4(),
        "slug": "motors",
        "name": "Motors",
        "description": "Electric motors for various applications",
        "icon": "⚡",
        "display_order": 5,
        "is_active": True,
    },
]


def get_seed_products(categories):
    """Generate seed products based on categories."""
    fans_id = next(c["id"] for c in categories if c["slug"] == "fans")
    kitchen_id = next(c["id"] for c in categories if c["slug"] == "kitchen")
    irons_id = next(c["id"] for c in categories if c["slug"] == "irons")
    
    return [
        {
            "id": uuid.uuid4(),
            "sku": "HAV-CF-1200",
            "name": "Havells Ceiling Fan 1200mm",
            "slug": "havells-ceiling-fan-1200mm",
            "description": "High-speed ceiling fan with aerodynamic blades for maximum air delivery.",
            "category_id": fans_id,
            "brand": "Havells",
            "price": Decimal("2499.00"),
            "original_price": Decimal("2999.00"),
            "bargain_available": True,
            "stock_quantity": 15,
            "reserved_quantity": 0,
            "status": "active",
            "is_featured": True,
            "is_bestseller": True,
            "rating": Decimal("4.5"),
            "review_count": 128,
            "tags": ["bestseller", "featured", "1200mm"],
        },
        {
            "id": uuid.uuid4(),
            "sku": "BAJ-MG-750W",
            "name": "Bajaj Mixer Grinder 750W",
            "slug": "bajaj-mixer-grinder-750w",
            "description": "Powerful 750W motor with 3 stainless steel jars for all your grinding needs.",
            "category_id": kitchen_id,
            "brand": "Bajaj",
            "price": Decimal("3299.00"),
            "original_price": Decimal("3999.00"),
            "bargain_available": True,
            "stock_quantity": 10,
            "reserved_quantity": 0,
            "status": "active",
            "is_featured": True,
            "is_bestseller": True,
            "rating": Decimal("4.3"),
            "review_count": 95,
            "tags": ["bestseller", "featured", "750w"],
        },
        {
            "id": uuid.uuid4(),
            "sku": "PHI-IR-1000W",
            "name": "Philips Electric Iron 1000W",
            "slug": "philips-electric-iron-1000w",
            "description": "Lightweight dry iron with non-stick soleplate for smooth ironing.",
            "category_id": irons_id,
            "brand": "Philips",
            "price": Decimal("899.00"),
            "original_price": Decimal("1199.00"),
            "bargain_available": False,
            "stock_quantity": 20,
            "reserved_quantity": 0,
            "status": "active",
            "is_featured": True,
            "is_bestseller": False,
            "rating": Decimal("4.6"),
            "review_count": 210,
            "tags": ["featured", "1000w", "dry-iron"],
        },
        {
            "id": uuid.uuid4(),
            "sku": "CRO-TF-400",
            "name": "Crompton Table Fan 400mm",
            "slug": "crompton-table-fan-400mm",
            "description": "Compact table fan with oscillation and 3-speed control.",
            "category_id": fans_id,
            "brand": "Crompton",
            "price": Decimal("1899.00"),
            "original_price": Decimal("2299.00"),
            "bargain_available": True,
            "stock_quantity": 12,
            "reserved_quantity": 0,
            "status": "active",
            "is_featured": False,
            "is_bestseller": True,
            "rating": Decimal("4.2"),
            "review_count": 67,
            "tags": ["bestseller", "400mm", "table-fan"],
        },
        {
            "id": uuid.uuid4(),
            "sku": "PRE-IC-2000",
            "name": "Prestige Induction Cooktop",
            "slug": "prestige-induction-cooktop",
            "description": "Energy-efficient induction cooktop with multiple preset menus.",
            "category_id": kitchen_id,
            "brand": "Prestige",
            "price": Decimal("2199.00"),
            "original_price": Decimal("2799.00"),
            "bargain_available": True,
            "stock_quantity": 8,
            "reserved_quantity": 0,
            "status": "active",
            "is_featured": True,
            "is_bestseller": False,
            "rating": Decimal("4.4"),
            "review_count": 143,
            "tags": ["featured", "induction", "energy-efficient"],
        },
    ]


async def seed_database():
    """Seed the database with initial data."""
    from app.db.database import async_session_maker
    from app.models.product import Category, Product
    
    async with async_session_maker() as session:
        # Add categories
        for cat_data in SEED_CATEGORIES:
            category = Category(
                **cat_data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(category)
        
        await session.commit()
        print(f"Added {len(SEED_CATEGORIES)} categories")
        
        # Add products
        products = get_seed_products(SEED_CATEGORIES)
        for prod_data in products:
            product = Product(
                **prod_data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(product)
        
        await session.commit()
        print(f"Added {len(products)} products")
        
        print("Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(seed_database())
