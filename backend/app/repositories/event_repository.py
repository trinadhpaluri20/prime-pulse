from typing import Optional, List, Tuple
from sqlalchemy import select, func, desc, asc
from sqlalchemy.orm import Session, joinedload
from app.models.competitor_event import CompetitorEvent
from app.models.event_source import EventSource
from app.schemas.event import CompetitorEventCreate, CompetitorEventUpdate


class EventRepository:
    """Repository handling database operations for CompetitorEvent entities."""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self, competitor_id: int, schema: CompetitorEventCreate
    ) -> CompetitorEvent:
        """Create a new competitor event, optionally creating its source."""
        source_id = None
        if schema.source:
            source = EventSource(
                name=schema.source.name,
                url=schema.source.url,
                source_type=schema.source.source_type.value,
                published_at=schema.source.published_at,
            )
            self.db.add(source)
            self.db.flush()  # populate source.id
            source_id = source.id

        event = CompetitorEvent(
            competitor_id=competitor_id,
            category=schema.category.value,
            title=schema.title,
            description=schema.description,
            event_date=schema.event_date,
            previous_value=schema.previous_value,
            new_value=schema.new_value,
            importance=schema.importance.value,
            source_id=source_id,
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: int) -> Optional[CompetitorEvent]:
        """Fetch competitor event by ID with source loaded."""
        statement = (
            select(CompetitorEvent)
            .options(joinedload(CompetitorEvent.source))
            .where(CompetitorEvent.id == event_id)
        )
        return self.db.execute(statement).scalar_one_or_none()

    def get_by_competitor(
        self,
        competitor_id: int,
        skip: int = 0,
        limit: int = 50,
        sort_order: str = "desc",
    ) -> Tuple[List[CompetitorEvent], int]:
        """Fetch list of events for a competitor with pagination and sorting by event_date."""
        total_stmt = (
            select(func.count(CompetitorEvent.id))
            .where(CompetitorEvent.competitor_id == competitor_id)
        )
        total = self.db.execute(total_stmt).scalar() or 0

        order_clause = desc(CompetitorEvent.event_date) if sort_order.lower() == "desc" else asc(CompetitorEvent.event_date)

        query = (
            select(CompetitorEvent)
            .options(joinedload(CompetitorEvent.source))
            .where(CompetitorEvent.competitor_id == competitor_id)
            .order_by(order_clause)
            .offset(skip)
            .limit(limit)
        )
        items = self.db.execute(query).scalars().all()
        return list(items), total

    def search_events(
        self,
        competitor_id: Optional[int] = None,
        start_date: Optional[object] = None,
        end_date: Optional[object] = None,
        category: Optional[str] = None,
        keyword: Optional[str] = None,
        limit: int = 50,
        sort_order: str = "asc",
    ) -> List[CompetitorEvent]:
        """Search competitor events matching given filters, ordered chronologically by event_date."""
        statement = select(CompetitorEvent).options(joinedload(CompetitorEvent.source), joinedload(CompetitorEvent.competitor))

        conditions = []
        if competitor_id is not None:
            conditions.append(CompetitorEvent.competitor_id == competitor_id)
        if start_date is not None:
            conditions.append(CompetitorEvent.event_date >= start_date)
        if end_date is not None:
            conditions.append(CompetitorEvent.event_date <= end_date)
        if category is not None:
            conditions.append(CompetitorEvent.category == category)
        if keyword is not None and keyword.strip():
            kw = f"%{keyword.strip()}%"
            conditions.append(
                (CompetitorEvent.title.ilike(kw)) | (CompetitorEvent.description.ilike(kw))
            )

        if conditions:
            statement = statement.where(*conditions)

        order_clause = asc(CompetitorEvent.event_date) if sort_order.lower() == "asc" else desc(CompetitorEvent.event_date)
        statement = statement.order_by(order_clause).limit(limit)

        return list(self.db.execute(statement).scalars().all())

    def update(
        self, event: CompetitorEvent, schema: CompetitorEventUpdate
    ) -> CompetitorEvent:
        """Update fields of an existing competitor event."""
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key in ["category", "importance"] and hasattr(value, "value"):
                setattr(event, key, value.value)
            else:
                setattr(event, key, value)

        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: CompetitorEvent) -> None:
        """Delete an event."""
        self.db.delete(event)
        self.db.commit()
