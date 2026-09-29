import math
import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.competitor_event import CompetitorEvent
from app.repositories.competitor_repository import CompetitorRepository
from app.repositories.event_repository import EventRepository
from app.services.hindsight_service import HindsightMemoryService
from app.schemas.event import (
    CompetitorEventCreate,
    CompetitorEventUpdate,
    CompetitorEventResponse,
    CompetitorEventListResponse,
    MemoryStatusResponse,
)
from app.utils.errors import NotFoundError, ValidationErrorException

logger = logging.getLogger(__name__)


class EventService:
    """Business logic service for managing competitor events and Hindsight persistent memory retention."""

    def __init__(self, db: Session, hindsight_service: Optional[HindsightMemoryService] = None):
        self.event_repository = EventRepository(db)
        self.competitor_repository = CompetitorRepository(db)
        self.hindsight_service = hindsight_service or HindsightMemoryService()

    def _build_memory_payload(self, competitor_name: str, event: CompetitorEvent) -> str:
        """Construct a structured, human-readable competitive intelligence memory payload."""
        source_str = "None"
        if event.source:
            source_str = f"{event.source.name} ({event.source.url or 'N/A'})"

        prev_val = event.previous_value or "N/A"
        new_val = event.new_value or "N/A"
        event_date_str = (
            event.event_date.isoformat()
            if hasattr(event.event_date, "isoformat")
            else str(event.event_date)
        )

        return (
            f"Competitor Event Observation\n\n"
            f"Competitor: {competitor_name} (ID: {event.competitor_id})\n"
            f"Database Event ID: {event.id}\n\n"
            f"Category: {event.category}\n"
            f"Title: {event.title}\n"
            f"Date: {event_date_str}\n"
            f"Importance: {event.importance}\n\n"
            f"Description:\n{event.description}\n\n"
            f"Previous State: {prev_val}\n"
            f"New State: {new_val}\n\n"
            f"Source: {source_str}"
        )

    def _retain_memory_safely(
        self, competitor_name: str, event: CompetitorEvent
    ) -> MemoryStatusResponse:
        """Safely retain memory in Hindsight without interrupting database transactions on failure."""
        doc_id = f"event-{event.competitor_id}-{event.id}"
        bank_id = settings.HINDSIGHT_BANK_ID

        if not self.hindsight_service.is_configured:
            return MemoryStatusResponse(
                status="not_configured",
                document_id=doc_id,
                bank_id=bank_id,
                error="HINDSIGHT_API_KEY is not configured.",
            )

        try:
            content = self._build_memory_payload(competitor_name, event)
            metadata = {
                "competitor_id": str(event.competitor_id),
                "competitor_name": competitor_name,
                "event_id": str(event.id),
                "category": str(event.category),
                "importance": str(event.importance),
            }
            tags = [
                str(event.category),
                competitor_name.lower().replace(" ", "_"),
                str(event.importance),
                "competitor_event",
            ]

            self.hindsight_service.retain(
                content=content,
                context="competitor_event",
                timestamp=event.event_date,
                metadata=metadata,
                document_id=doc_id,
                tags=tags,
            )
            return MemoryStatusResponse(
                status="retained",
                document_id=doc_id,
                bank_id=bank_id,
            )
        except Exception as err:
            logger.warning(
                f"Hindsight memory retention failed for event {event.id}: {str(err)}"
            )
            return MemoryStatusResponse(
                status="failed",
                document_id=doc_id,
                bank_id=bank_id,
                error="Memory retention failed",
            )

    def create_event(
        self, competitor_id: int, schema: CompetitorEventCreate
    ) -> CompetitorEventResponse:
        """Validate competitor existence, persist structured DB event, and push memory into Hindsight."""
        competitor = self.competitor_repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)

        # Step 1: Save structured DB record
        event = self.event_repository.create(competitor_id, schema)

        # Step 2: Push memory into Hindsight using deterministic document_id
        memory_status = self._retain_memory_safely(competitor.name, event)

        # Step 3: Formulate response with attached memory status
        response = CompetitorEventResponse.model_validate(event)
        response.memory = memory_status
        return response

    def get_event(self, event_id: int) -> CompetitorEventResponse:
        """Retrieve competitor event by ID or raise NotFoundError."""
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundError("CompetitorEvent", event_id)
        return CompetitorEventResponse.model_validate(event)

    def list_competitor_events(
        self,
        competitor_id: int,
        page: int = 1,
        page_size: int = 20,
        sort_order: str = "desc",
    ) -> CompetitorEventListResponse:
        """Verify competitor exists and return paginated, sorted competitor events."""
        competitor = self.competitor_repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)

        page = max(1, page)
        page_size = max(1, min(100, page_size))
        skip = (page - 1) * page_size

        if sort_order.lower() not in ["asc", "desc"]:
            sort_order = "desc"

        items, total = self.event_repository.get_by_competitor(
            competitor_id=competitor_id,
            skip=skip,
            limit=page_size,
            sort_order=sort_order,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return CompetitorEventListResponse(
            items=[CompetitorEventResponse.model_validate(e) for e in items],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def update_event(
        self, event_id: int, schema: CompetitorEventUpdate
    ) -> CompetitorEventResponse:
        """Update existing competitor event and sync updated memory to Hindsight."""
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundError("CompetitorEvent", event_id)

        # Step 1: Update structured DB record
        updated = self.event_repository.update(event, schema)
        competitor = self.competitor_repository.get_by_id(updated.competitor_id)
        comp_name = competitor.name if competitor else "Unknown Competitor"

        # Step 2: Push updated memory to Hindsight using the same deterministic document_id
        memory_status = self._retain_memory_safely(comp_name, updated)

        response = CompetitorEventResponse.model_validate(updated)
        response.memory = memory_status
        return response

    def sync_event_memory(self, event_id: int) -> CompetitorEventResponse:
        """Manually trigger Hindsight memory retention for an existing event."""
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundError("CompetitorEvent", event_id)

        competitor = self.competitor_repository.get_by_id(event.competitor_id)
        comp_name = competitor.name if competitor else "Unknown Competitor"

        memory_status = self._retain_memory_safely(comp_name, event)
        response = CompetitorEventResponse.model_validate(event)
        response.memory = memory_status
        return response

    def delete_event(self, event_id: int) -> None:
        """Delete competitor event by ID."""
        event = self.event_repository.get_by_id(event_id)
        if not event:
            raise NotFoundError("CompetitorEvent", event_id)
        self.event_repository.delete(event)
