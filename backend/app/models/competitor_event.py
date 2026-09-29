from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CompetitorEvent(Base):
    """Competitor Event ORM entity."""

    __tablename__ = "competitor_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    competitor_id: Mapped[int] = mapped_column(
        ForeignKey("competitors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    event_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    previous_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    importance: Mapped[str] = mapped_column(
        String(50), nullable=False, default="medium", index=True
    )
    source_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("event_sources.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    competitor: Mapped["Competitor"] = relationship(
        "Competitor", back_populates="events"
    )
    source: Mapped[Optional["EventSource"]] = relationship(
        "EventSource", back_populates="events"
    )
