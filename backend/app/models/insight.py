from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Insight(Base):
    """Insight ORM entity representing detected patterns, trends, and strategic intelligence."""

    __tablename__ = "insights"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # pattern, trend, unusual, historical
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    competitor_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("competitors.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.85)
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium", index=True
    )  # high, medium, low
    timeframe_days: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    
    # Detailed evidence breakdown stored as JSON string (facts, observations, sequence, why_this_matters)
    evidence_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    competitor: Mapped[Optional["Competitor"]] = relationship(
        "Competitor", back_populates="insights"
    )
