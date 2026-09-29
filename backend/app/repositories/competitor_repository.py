from typing import Optional, List, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.competitor import Competitor
from app.schemas.competitor import CompetitorCreate, CompetitorUpdate


class CompetitorRepository:
    """Repository handling database operations for Competitor entities."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, schema: CompetitorCreate) -> Competitor:
        """Create a new competitor record."""
        competitor = Competitor(
            name=schema.name,
            description=schema.description,
            industry=schema.industry,
            website=schema.website,
        )
        self.db.add(competitor)
        self.db.commit()
        self.db.refresh(competitor)
        return competitor

    def get_by_id(self, competitor_id: int) -> Optional[Competitor]:
        """Fetch competitor by ID."""
        statement = select(Competitor).where(Competitor.id == competitor_id)
        return self.db.execute(statement).scalar_one_or_none()

    def get_by_name(self, name: str) -> Optional[Competitor]:
        """Fetch competitor by exact name."""
        statement = select(Competitor).where(Competitor.name == name)
        return self.db.execute(statement).scalar_one_or_none()

    def get_all(
        self, skip: int = 0, limit: int = 50
    ) -> Tuple[List[Competitor], int]:
        """List competitors with pagination."""
        total_stmt = select(func.count(Competitor.id))
        total = self.db.execute(total_stmt).scalar() or 0

        query = select(Competitor).order_by(Competitor.created_at.desc()).offset(skip).limit(limit)
        items = self.db.execute(query).scalars().all()
        return list(items), total

    def update(
        self, competitor: Competitor, schema: CompetitorUpdate
    ) -> Competitor:
        """Update fields of an existing competitor."""
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(competitor, key, value)
        self.db.commit()
        self.db.refresh(competitor)
        return competitor

    def delete(self, competitor: Competitor) -> None:
        """Delete a competitor."""
        self.db.delete(competitor)
        self.db.commit()
