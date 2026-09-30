from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, or_, desc
import json

from app.models.activity import Activity
from app.models.competitor import Competitor
from app.models.source import Source
from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse,
    TimelineEventResponse,
    TimelineEventHistoricalContext,
)
from app.utils.errors import NotFoundError


class ActivityService:
    """Business logic service for managing Activities and Timeline events."""

    def __init__(self, db: Session):
        self.db = db

    def get_activities(
        self,
        competitor: Optional[str] = None,
        competitor_id: Optional[int] = None,
        activity_type: Optional[str] = None,
        importance: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[ActivityResponse]:
        """Fetch filtered activities."""
        stmt = (
            select(Activity)
            .options(joinedload(Activity.competitor), joinedload(Activity.source))
            .order_by(desc(Activity.detected_at))
        )

        conditions = []
        if competitor_id:
            conditions.append(Activity.competitor_id == competitor_id)
        if competitor and competitor.lower() not in ("all", "all competitors"):
            conditions.append(
                Activity.competitor.has(Competitor.name.ilike(f"%{competitor}%"))
            )
        if activity_type and activity_type.lower() not in ("all", "all activity"):
            conditions.append(Activity.activity_type.ilike(activity_type))
        if importance and importance.lower() != "all":
            conditions.append(Activity.importance.ilike(importance))
        if start_date:
            conditions.append(Activity.detected_at >= start_date)
        if end_date:
            conditions.append(Activity.detected_at <= end_date)
        if search:
            search_clause = or_(
                Activity.title.ilike(f"%{search}%"),
                Activity.description.ilike(f"%{search}%"),
            )
            conditions.append(search_clause)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        activities = self.db.scalars(stmt.offset(skip).limit(limit)).unique().all()

        results = []
        for a in activities:
            comp_name = a.competitor.name if a.competitor else f"Competitor {a.competitor_id}"
            source_name = a.source.name if a.source else "Direct Web Source"
            source_url = a.source.url if a.source else None
            results.append(
                ActivityResponse(
                    id=a.id,
                    competitor_id=a.competitor_id,
                    activity_type=a.activity_type,
                    title=a.title,
                    description=a.description,
                    source_id=a.source_id,
                    importance=a.importance,
                    detected_at=a.detected_at,
                    created_at=a.created_at,
                    competitor_name=comp_name,
                    source_name=source_name,
                    source_url=source_url,
                )
            )
        return results

    def get_activity_by_id(self, activity_id: int) -> ActivityResponse:
        """Fetch single activity by ID."""
        stmt = (
            select(Activity)
            .options(joinedload(Activity.competitor), joinedload(Activity.source))
            .where(Activity.id == activity_id)
        )
        activity = self.db.scalar(stmt)
        if not activity:
            raise NotFoundError("Activity", activity_id)

        comp_name = activity.competitor.name if activity.competitor else f"Competitor {activity.competitor_id}"
        source_name = activity.source.name if activity.source else "Direct Web Source"
        source_url = activity.source.url if activity.source else None

        return ActivityResponse(
            id=activity.id,
            competitor_id=activity.competitor_id,
            activity_type=activity.activity_type,
            title=activity.title,
            description=activity.description,
            source_id=activity.source_id,
            importance=activity.importance,
            detected_at=activity.detected_at,
            created_at=activity.created_at,
            competitor_name=comp_name,
            source_name=source_name,
            source_url=source_url,
        )

    def create_activity(self, schema: ActivityCreate) -> ActivityResponse:
        """Create new activity record."""
        # Ensure competitor exists
        comp = self.db.get(Competitor, schema.competitor_id)
        if not comp:
            raise NotFoundError("Competitor", schema.competitor_id)

        activity = Activity(
            competitor_id=schema.competitor_id,
            activity_type=schema.activity_type.lower(),
            title=schema.title,
            description=schema.description,
            source_id=schema.source_id,
            importance=schema.importance.lower(),
            detected_at=schema.detected_at,
            metadata_json=schema.metadata_json,
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)

        return self.get_activity_by_id(activity.id)

    def get_timeline_events(
        self,
        competitor: Optional[str] = None,
        activity_type: Optional[str] = None,
        importance: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        search: Optional[str] = None,
    ) -> List[TimelineEventResponse]:
        """Convert database activities into frontend-formatted TimelineEvents."""
        activities = self.get_activities(
            competitor=competitor,
            activity_type=activity_type,
            importance=importance,
            start_date=start_date,
            end_date=end_date,
            search=search,
            limit=200,
        )

        timeline_events: List[TimelineEventResponse] = []
        for idx, act in enumerate(activities):
            # Parse metadata if present
            meta = {}
            if hasattr(act, "metadata_json") and act.metadata_json:
                try:
                    meta = json.loads(act.metadata_json)
                except Exception:
                    meta = {}

            # Map category to capitalized frontend type
            type_map = {
                "pricing": "Pricing",
                "product": "Product",
                "hiring": "Hiring",
                "marketing": "Marketing",
                "website": "Website",
            }
            cap_type = type_map.get(act.activity_type.lower(), act.activity_type.capitalize())

            # Format dates
            date_str = act.detected_at.strftime("%b %d, %Y")
            time_str = act.detected_at.strftime("%I:%M %p UTC")

            # Context
            hist_ctx = None
            if "historical_context" in meta:
                ctx_dict = meta["historical_context"]
                hist_ctx = TimelineEventHistoricalContext(
                    summary=ctx_dict.get("summary", ""),
                    similarCount=ctx_dict.get("similarCount", 1),
                    sequence=ctx_dict.get("sequence"),
                )
            else:
                hist_ctx = TimelineEventHistoricalContext(
                    summary=f"Preceded by historical {cap_type.lower()} patterns across tracked timeline.",
                    similarCount=2,
                    sequence=[
                        {"label": f"Historical baseline for {act.competitor_name}", "daysOffset": -45},
                        {"label": f"Current event: {act.title}", "daysOffset": 0},
                    ],
                )

            timeline_events.append(
                TimelineEventResponse(
                    id=f"ev-{act.id}",
                    competitor=act.competitor_name or f"Competitor {act.competitor_id}",
                    type=cap_type,
                    title=act.title,
                    description=act.description,
                    fullDescription=meta.get("fullDescription", act.description),
                    timestamp=act.detected_at.isoformat(),
                    dateDisplay=date_str,
                    timeDisplay=time_str,
                    importance=act.importance.lower(),
                    source=act.source_name or "Official Domain Monitoring",
                    detectedChanges=meta.get("detectedChanges", [act.title]),
                    historicalContext=hist_ctx,
                    relatedEventIds=meta.get("relatedEventIds", []),
                )
            )

        return timeline_events
