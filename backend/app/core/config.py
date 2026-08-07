"""
Configuration management for the application.
Loads settings from environment variables with validation.
"""
from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Environment
    environment: str = Field(default="development")
    debug: bool = Field(default=True)
    
    # Supabase
    supabase_url: str = Field(...)
    supabase_key: str = Field(...)  # Anon key for client
    supabase_service_key: str = Field(...)  # Service role key for admin operations
    supabase_jwt_secret: str = Field(...)
    
    # Database
    database_url: str = Field(...)
    
    # CORS
    cors_origins: str = Field(default="http://localhost:5173")
    
    # API
    api_v1_prefix: str = Field(default="/api/v1")
    project_name: str = Field(default="E-Commerce API")
    version: str = Field(default="1.0.0")
    
    # Security
    secret_key: str = Field(default="dev-secret-key-change-in-production")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=7)
    
    # Rate Limiting
    rate_limit_per_minute: int = Field(default=60)
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reading .env file on every request.
    """
    return Settings()


# Convenience accessor
settings = get_settings()
