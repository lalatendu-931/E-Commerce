# API module exports
from app.api.deps import (
    get_current_user,
    get_current_user_optional,
    get_current_active_user,
    get_current_staff_user,
    get_current_admin_user,
    CurrentUser,
    CurrentUserOptional,
    CurrentActiveUser,
    CurrentStaffUser,
    CurrentAdminUser,
    DbSession,
)
from app.api.middleware import (
    LoggingMiddleware,
    SecurityHeadersMiddleware,
    RequestIDMiddleware,
)
from app.api.routes import (
    auth_router,
    users_router,
    products_router,
    orders_router,
    prebookings_router,
    repairs_router,
)

__all__ = [
    # Dependencies
    "get_current_user",
    "get_current_user_optional",
    "get_current_active_user",
    "get_current_staff_user",
    "get_current_admin_user",
    "CurrentUser",
    "CurrentUserOptional",
    "CurrentActiveUser",
    "CurrentStaffUser",
    "CurrentAdminUser",
    "DbSession",
    # Middleware
    "LoggingMiddleware",
    "SecurityHeadersMiddleware",
    "RequestIDMiddleware",
    # Routers
    "auth_router",
    "users_router",
    "products_router",
    "orders_router",
    "prebookings_router",
    "repairs_router",
]
