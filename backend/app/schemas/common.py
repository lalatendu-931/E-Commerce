"""
Common Pydantic schemas used across the application.
"""
from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ResponseMessage(BaseModel):
    """Standard response message schema."""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Standard error response schema."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = 1
    page_size: int = 20
    
    @property
    def skip(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""
    items: List[T]
    total: int
    page: int
    page_size: int
    
    @property
    def total_pages(self) -> int:
        """Calculate total number of pages."""
        return (self.total + self.page_size - 1) // self.page_size


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    environment: str


class StoreInfo(BaseModel):
    """Store information schema."""
    name: str = "E-Commerce Store"
    address: str = "123, Main Market Road, Near Bus Stand, City Center"
    phone: str = "+91 98765 43210"
    alternate_phone: str = "+91 87654 32109"
    hours: str = "Open 24/7"
    map_link: str = "https://maps.google.com"
