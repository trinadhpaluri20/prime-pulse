import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings typed configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core Application Settings
    APP_NAME: str = Field(default="Competitive Intelligence Agent API")
    APP_ENV: str = Field(default="development")
    BACKEND_HOST: str = Field(default="0.0.0.0")
    BACKEND_PORT: int = Field(default=8000)

    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./competitive_intelligence.db"
    )

    # CORS Settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    # Hindsight Persistent Memory Configuration
    HINDSIGHT_BASE_URL: str = Field(
        default="https://api.hindsight.vectorize.io"
    )
    HINDSIGHT_API_KEY: Optional[str] = Field(default=None)
    HINDSIGHT_BANK_ID: str = Field(default="competitive-intelligence")
    HINDSIGHT_TIMEOUT_SECONDS: float = Field(default=10.0)

    # Google GenAI Gemini Configuration (Phase 6)
    GEMINI_API_KEY: Optional[str] = Field(default=None)
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")
    GEMINI_TIMEOUT_SECONDS: float = Field(default=15.0)

    # Legacy / Alternate Provider Placeholders
    XAI_API_KEY: Optional[str] = Field(default=None)
    XAI_BASE_URL: str = Field(default="https://api.x.ai/v1")
    XAI_MODEL: str = Field(default="grok-2-latest")
    XAI_TIMEOUT_SECONDS: float = Field(default=15.0)

    LLM_PROVIDER: Optional[str] = Field(default=None)
    LLM_MODEL: Optional[str] = Field(default=None)
    LLM_API_KEY: Optional[str] = Field(default=None)

    @property
    def is_sqlite(self) -> bool:
        """Returns True if configured database is SQLite."""
        return self.DATABASE_URL.startswith("sqlite")

    @property
    def is_hindsight_configured(self) -> bool:
        """Returns True if Hindsight credentials are configured."""
        return bool(self.HINDSIGHT_API_KEY and self.HINDSIGHT_API_KEY.strip())

    @property
    def is_gemini_configured(self) -> bool:
        """Returns True if valid GEMINI_API_KEY is configured."""
        if not self.GEMINI_API_KEY or not self.GEMINI_API_KEY.strip():
            return False
        return self.GEMINI_API_KEY.strip() != "YOUR_GOOGLE_AI_STUDIO_API_KEY"

    @property
    def is_xai_configured(self) -> bool:
        """Returns True if valid XAI API Key is configured."""
        return bool(self.XAI_API_KEY and self.XAI_API_KEY.strip())



settings = Settings()
