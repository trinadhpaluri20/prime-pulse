import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import get_db, engine
from app.db.base import Base
from app.services.hindsight_service import HindsightMemoryService
from app.utils.errors import (
    AppException,
    app_exception_handler,
    global_exception_handler,
)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager handling startup and shutdown events."""
    logger.info(f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' environment...")
    
    # Auto-create tables for local development if SQLite
    if settings.is_sqlite:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Memory-driven Competitive Intelligence Platform API for HackwithHyderabad 3.0",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include API Router
app.include_router(api_router, prefix="/api/v1")


# Health Alias Endpoint (/api/health)
@app.get(
    "/api/health",
    tags=["Health"],
    summary="Root Health Check",
    status_code=status.HTTP_200_OK,
)
def root_health(db: Session = Depends(get_db)):
    """Check API process, database connectivity, and Hindsight memory status."""
    db_status = "disconnected"
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"

    hindsight_service = HindsightMemoryService()
    hindsight_health = hindsight_service.health_check()
    hindsight_status = hindsight_health.get("status", "unknown")

    overall_status = "healthy"
    if db_status != "connected" or hindsight_status == "connection_failed":
        overall_status = "degraded"

    return {
        "status": overall_status,
        "service": "competitive-intelligence-agent",
        "database": db_status,
        "hindsight": hindsight_status,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,
    )
