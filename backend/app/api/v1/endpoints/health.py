from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.config import settings
from app.services.hindsight_service import HindsightMemoryService

router = APIRouter()


@router.get("/health", summary="Health Check", response_model=Dict[str, Any])
def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Check API, database, Hindsight persistent memory, and Gemini LLM health status."""
    # Database status
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"

    # Hindsight memory status
    hindsight_service = HindsightMemoryService()
    hindsight_health = hindsight_service.health_check()
    hindsight_status = hindsight_health.get("status", "unknown")

    # Groq LLM status
    groq_status = "configured" if settings.is_groq_configured else "not_configured"

    overall_status = "healthy"
    if db_status != "connected":
        overall_status = "degraded"
    elif hindsight_status == "connection_failed":
        overall_status = "degraded"

    return {
        "status": overall_status,
        "service": "competitive-intelligence-agent",
        "environment": settings.APP_ENV,
        "database": db_status,
        "hindsight": hindsight_status,
        "groq": groq_status,
        "gemini": groq_status,
    }
