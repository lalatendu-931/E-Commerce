"""
Supabase client configuration.
Provides authenticated and service-level Supabase access.
"""
from functools import lru_cache

from supabase import create_client, Client

from app.core.config import settings


@lru_cache
def get_supabase_client() -> Client:
    """
    Get Supabase client with anon key (for authenticated user operations).
    Cached to avoid creating multiple clients.
    """
    return create_client(
        settings.supabase_url,
        settings.supabase_key
    )


@lru_cache
def get_supabase_admin_client() -> Client:
    """
    Get Supabase client with service role key (for admin operations).
    Use with caution - bypasses Row Level Security.
    """
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key
    )


# Convenience accessors
supabase = get_supabase_client()
supabase_admin = get_supabase_admin_client()
