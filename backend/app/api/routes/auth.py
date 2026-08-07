"""
Authentication API routes.
Handles user registration, login, and token management via Supabase.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DbSession, CurrentUser, CurrentUserOptional
from app.db.supabase import supabase, supabase_admin
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegister,
    LoginRequest,
    LoginResponse,
    UserResponse,
    UserCreate,
)
from app.schemas.common import ResponseMessage
from app.core.logging import get_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: DbSession,
):
    """
    Register a new user with email and password.
    Creates account in Supabase and stores profile in database.
    """
    try:
        # Register with Supabase
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create account. Email may already be registered.",
            )
        
        # Create user profile in database
        new_user = User(
            supabase_id=auth_response.user.id,
            email=user_data.email,
            name=user_data.name,
            role=UserRole.CUSTOMER,
            auth_provider="email",
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        logger.info(f"New user registered: {user_data.email}")
        
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again.",
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: DbSession,
):
    """
    Login with email and password.
    Returns access token and user profile.
    """
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        
        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        
        # Get or create user profile
        result = await db.execute(
            select(User).where(User.supabase_id == auth_response.user.id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create profile for existing Supabase user
            user = User(
                supabase_id=auth_response.user.id,
                email=credentials.email,
                role=UserRole.CUSTOMER,
                auth_provider="email",
            )
            db.add(user)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"User logged in: {credentials.email}")
        
        return LoginResponse(
            access_token=auth_response.session.access_token,
            refresh_token=auth_response.session.refresh_token,
            user=UserResponse.model_validate(user),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed. Please check your credentials.",
        )


@router.post("/login/google")
async def login_with_google():
    """
    Get Google OAuth URL for login.
    Frontend should redirect user to this URL.
    """
    try:
        response = supabase.auth.sign_in_with_oauth({
            "provider": "google",
        })
        
        return {"url": response.url}
        
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize Google login",
        )


@router.post("/callback/google", response_model=LoginResponse)
async def google_callback(
    access_token: str,
    db: DbSession,
):
    """
    Handle Google OAuth callback.
    Exchange token and create/update user profile.
    """
    try:
        # Get user from Supabase using the token
        user_response = supabase.auth.get_user(access_token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google authentication",
            )
        
        supabase_user = user_response.user
        
        # Get or create user profile
        result = await db.execute(
            select(User).where(User.supabase_id == supabase_user.id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user profile
            user = User(
                supabase_id=supabase_user.id,
                email=supabase_user.email,
                name=supabase_user.user_metadata.get("full_name"),
                role=UserRole.CUSTOMER,
                auth_provider="google",
            )
            db.add(user)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
        
        # Get session
        session = supabase.auth.get_session()
        
        return LoginResponse(
            access_token=session.access_token if session else access_token,
            refresh_token=session.refresh_token if session else "",
            user=UserResponse.model_validate(user),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete Google login",
        )


@router.post("/logout", response_model=ResponseMessage)
async def logout(current_user: CurrentUser):
    """
    Logout current user.
    Invalidates the session in Supabase.
    """
    try:
        supabase.auth.sign_out()
        logger.info(f"User logged out: {current_user.email}")
        return ResponseMessage(message="Logged out successfully")
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Still return success - client should clear tokens
        return ResponseMessage(message="Logged out")


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token.
    """
    try:
        response = supabase.auth.refresh_session(refresh_token)
        
        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to refresh token",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: CurrentUser):
    """
    Get current authenticated user's profile.
    """
    return current_user


@router.post("/password/reset")
async def request_password_reset(email: str):
    """
    Request password reset email.
    """
    try:
        supabase.auth.reset_password_email(email)
        # Always return success to prevent email enumeration
        return ResponseMessage(
            message="If an account exists with this email, a reset link has been sent."
        )
        
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        # Still return success to prevent enumeration
        return ResponseMessage(
            message="If an account exists with this email, a reset link has been sent."
        )
