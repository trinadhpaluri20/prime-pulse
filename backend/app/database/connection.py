import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("app.database.connection")

# Determine connect_args based on DB dialect
connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        echo=False,
    )
else:
    # PostgreSQL configuration
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=False,
        )
    except Exception as e:
        logger.warning(
            f"Failed to initialize PostgreSQL engine with URL '{db_url}': {e}. Falling back to SQLite."
        )
        engine = create_engine(
            "sqlite:///./competitive_intelligence.db",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
            echo=False,
        )


def check_db_connection() -> bool:
    """Verifies that the database is reachable and responsive."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"Database connection check failed: {exc}")
        return False
