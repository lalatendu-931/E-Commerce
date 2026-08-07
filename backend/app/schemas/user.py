"""
Pydantic schemas for user-related data validation.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import UserRole


# ============ Base Schemas ============

class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^[+]?[\d\s-]{10,20}$")
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10, pattern=r"^\d{6}$")


# ============ Create Schemas ============

class UserCreate(UserBase):
    """Schema for creating a new user."""
    supabase_id: str
    auth_provider: str = "email"


class UserRegister(BaseModel):
    """Schema for user registration via API."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: Optional[str] = None


# ============ Update Schemas ============

class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    
    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    """Schema for updating user role (admin only)."""
    role: UserRole


# ============ Response Schemas ============

class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    role: UserRole
    is_active: bool
    auth_provider: str
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class UserPublicResponse(BaseModel):
    """Public user info (limited fields)."""
    id: UUID
    name: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Auth Schemas ============

class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Schema for JWT token payload."""
    sub: str  # User ID
    email: str
    role: UserRole
    exp: datetime
