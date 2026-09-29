import math
from sqlalchemy.orm import Session
from app.repositories.competitor_repository import CompetitorRepository
from app.schemas.competitor import (
    CompetitorCreate,
    CompetitorUpdate,
    CompetitorResponse,
    CompetitorListResponse,
)
from app.utils.errors import NotFoundError, ValidationErrorException


class CompetitorService:
    """Business logic service for managing competitors."""

    def __init__(self, db: Session):
        self.repository = CompetitorRepository(db)

    def create_competitor(self, schema: CompetitorCreate) -> CompetitorResponse:
        """Validate and create a new competitor."""
        existing = self.repository.get_by_name(schema.name.strip())
        if existing:
            raise ValidationErrorException(
                f"Competitor with name '{schema.name}' already exists."
            )
        
        competitor = self.repository.create(schema)
        return CompetitorResponse.model_validate(competitor)

    def get_competitor(self, competitor_id: int) -> CompetitorResponse:
        """Retrieve competitor by ID or raise NotFoundError."""
        competitor = self.repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)
        return CompetitorResponse.model_validate(competitor)

    def list_competitors(
        self, page: int = 1, page_size: int = 20
    ) -> CompetitorListResponse:
        """List competitors with clean pagination bounds."""
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        skip = (page - 1) * page_size

        items, total = self.repository.get_all(skip=skip, limit=page_size)
        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return CompetitorListResponse(
            items=[CompetitorResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def update_competitor(
        self, competitor_id: int, schema: CompetitorUpdate
    ) -> CompetitorResponse:
        """Update existing competitor."""
        competitor = self.repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)

        if schema.name and schema.name.strip() != competitor.name:
            existing = self.repository.get_by_name(schema.name.strip())
            if existing and existing.id != competitor_id:
                raise ValidationErrorException(
                    f"Another competitor with name '{schema.name}' already exists."
                )

        updated = self.repository.update(competitor, schema)
        return CompetitorResponse.model_validate(updated)

    def delete_competitor(self, competitor_id: int) -> None:
        """Delete competitor by ID."""
        competitor = self.repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)
        self.repository.delete(competitor)
