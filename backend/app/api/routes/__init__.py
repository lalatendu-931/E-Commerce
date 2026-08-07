# API routes module exports
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.products import router as products_router
from app.api.routes.orders import router as orders_router
from app.api.routes.prebookings import router as prebookings_router
from app.api.routes.repairs import router as repairs_router

__all__ = [
    "auth_router",
    "users_router",
    "products_router",
    "orders_router",
    "prebookings_router",
    "repairs_router",
]
