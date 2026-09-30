from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Competitor(Base):
    """Competitor ORM entity representing tracked market entities."""

    __tablename__ = "competitors"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    website: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="active", index=True
    )
    industry: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
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
    activities: Mapped[List["Activity"]] = relationship(
        "Activity",
        back_populates="competitor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    insights: Mapped[List["Insight"]] = relationship(
        "Insight",
        back_populates="competitor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    alerts: Mapped[List["Alert"]] = relationship(
        "Alert",
        back_populates="competitor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    sources: Mapped[List["Source"]] = relationship(
        "Source",
        back_populates="competitor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    events: Mapped[List["CompetitorEvent"]] = relationship(
        "CompetitorEvent",
        back_populates="competitor",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

