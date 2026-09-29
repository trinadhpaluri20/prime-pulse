from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class EventSource(Base):
    """Event Source ORM entity."""

    __tablename__ = "event_sources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    source_type: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True, default="user_entered"
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    events: Mapped[List["CompetitorEvent"]] = relationship(
        "CompetitorEvent", back_populates="source"
    )
