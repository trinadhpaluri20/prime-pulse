from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.activity import TimelineEventResponse
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get("", response_model=List[TimelineEventResponse], summary="Historical Timeline events feed")
def get_timeline(
    competitor: Optional[str] = Query(None, description="Competitor name filter"),
    activity_type: Optional[str] = Query(None, description="Activity category (Pricing, Product, Hiring, Marketing, Website)"),
    importance: Optional[str] = Query(None, description="Importance (high, medium, low)"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    search: Optional[str] = Query(None, description="Search query across event title and description"),
    db: Session = Depends(get_db),
):
    """Returns chronological timeline events with historical context, precursor relationships, and change diffs."""
    service = ActivityService(db)
    return service.get_timeline_events(
        competitor=competitor,
        activity_type=activity_type,
        importance=importance,
        start_date=start_date,
        end_date=end_date,
        search=search,
    )
