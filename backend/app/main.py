"""
E-Commerce Website - FastAPI Backend Application
Main application entry point.
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.db.database import init_db
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
from app.schemas.common import HealthCheckResponse, StoreInfo

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Application lifespan handler."""
    # Startup
    logger.info("Starting E-Commerce API...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    
    # Initialize database tables (in development)
    if settings.is_development:
        try:
            await init_db()
            logger.info("Database tables initialized")
        except Exception as e:
            logger.warning(f"Database connection failed: {e}")
            logger.warning("Running without database. Configure .env with Supabase credentials.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down E-Commerce API...")


# Create FastAPI application
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="""
    Backend API for E-Commerce Website - A full-stack electronics store with repair services.
    
    ## Features
    - **Authentication**: User registration, login with email/password and Google
    - **Products**: Browse products and categories with filters
    - **Orders**: Place orders with pay-online or reserve-pickup options
    - **Pre-bookings**: Book items in advance for store visits
    - **Repairs**: Submit repair inquiries for fans, motors, and small appliances
    
    ## Philosophy
    This system supports retail businesses, balancing online convenience 
    with offline trust and human verification.
    """,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None,
    lifespan=lifespan,
)


# ============ Middleware ============

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(LoggingMiddleware)

# Security headers (production only)
if settings.is_production:
    app.add_middleware(SecurityHeadersMiddleware)


# ============ Exception Handlers ============

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with clear messages."""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")
    
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": errors,
            "code": "VALIDATION_ERROR",
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    
    # Don't expose internal errors in production
    if settings.is_production:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": "An unexpected error occurred. Please try again later.",
                "code": "INTERNAL_ERROR",
            },
        )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "code": "INTERNAL_ERROR",
        },
    )


# ============ API Routes ============

# Include all routers under /api/v1 prefix
api_prefix = settings.api_v1_prefix

app.include_router(auth_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(products_router, prefix=api_prefix)
app.include_router(orders_router, prefix=api_prefix)
app.include_router(prebookings_router, prefix=api_prefix)
app.include_router(repairs_router, prefix=api_prefix)


# ============ Root Endpoints ============

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.project_name,
        "version": settings.version,
        "status": "running",
        "docs": "/docs" if settings.is_development else "Disabled in production",
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return HealthCheckResponse(
        status="healthy",
        version=settings.version,
        environment=settings.environment,
    )


@app.get("/store-info", response_model=StoreInfo, tags=["Info"])
async def get_store_info():
    """Get store contact information."""
    return StoreInfo()


# ============ Rate Limiting (Production) ============

if settings.is_production:
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        
        limiter = Limiter(key_func=get_remote_address)
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        
        logger.info("Rate limiting enabled")
    except ImportError:
        logger.warning("slowapi not installed, rate limiting disabled")


# ============ Run with Uvicorn ============

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.is_development,
        log_level="debug" if settings.debug else "info",
    )
