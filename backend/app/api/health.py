from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check verifying API process and Database connection",
    status_code=status.HTTP_200_OK,
)
def get_health(db: Session = Depends(get_db)):
    """Verifies that the API service is alive and the PostgreSQL/database connection is active."""
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "ok" if db_connected else "degraded",
        "service": "Competitive Intern API",
        "database": "connected" if db_connected else "disconnected",
    }
