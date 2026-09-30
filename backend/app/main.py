import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.api.router import api_router as unified_api_router
from app.api.v1.router import api_router as legacy_v1_router
from app.database.connection import engine
from app.database.session import get_db
from app.db.base import Base
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
        logger.info("Verifying database schema initialization...")
        Base.metadata.create_all(bind=engine)

    yield

    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Competitive Intern — AI Strategic Intelligence Platform for monitoring competitor activity, "
        "preserving historical context, detecting patterns, and generating competitive intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Compute allowed CORS origins dynamically
allowed_origins = list(settings.CORS_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"{request.method} {request.url.path} - Status: {response.status_code} - {duration_ms}ms"
    )
    return response


# Register Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include Primary API Router (/api)
app.include_router(unified_api_router, prefix="/api")

# Include Backward-Compatible Router (/api/v1)
app.include_router(legacy_v1_router, prefix="/api/v1")


# Root landing endpoint
@app.get("/", tags=["Root"])
def root_info():
    """Service information and docs index."""
    return {
        "service": "Competitive Intern API",
        "tagline": "AI Strategic Intelligence Platform",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,
    )
