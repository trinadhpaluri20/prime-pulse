from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse,
)
from app.services.activity_service import ActivityService

router = APIRouter(tags=["Activities"])


@router.get("/activities", response_model=List[ActivityResponse], summary="List competitor activities")
def list_activities(
    competitor: Optional[str] = Query(None, description="Competitor name or slug"),
    competitor_id: Optional[int] = Query(None, description="Competitor ID"),
    activity_type: Optional[str] = Query(None, description="pricing, product, hiring, marketing, website"),
    importance: Optional[str] = Query(None, description="high, medium, low"),
    start_date: Optional[datetime] = Query(None, description="ISO format start date"),
    end_date: Optional[datetime] = Query(None, description="ISO format end date"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Retrieve competitor activities with multi-filter criteria."""
    service = ActivityService(db)
    return service.get_activities(
        competitor=competitor,
        competitor_id=competitor_id,
        activity_type=activity_type,
        importance=importance,
        start_date=start_date,
        end_date=end_date,
        search=search,
        limit=limit,
        skip=skip,
    )


@router.get("/activities/{activity_id}", response_model=ActivityResponse, summary="Get activity by ID")
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """Fetch single activity details."""
    service = ActivityService(db)
    return service.get_activity_by_id(activity_id)


@router.post("/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED, summary="Create new activity")
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    """Record a detected competitor activity."""
    service = ActivityService(db)
    return service.create_activity(payload)


@router.get("/competitors/{competitor_id}/activities", response_model=List[ActivityResponse], summary="Get activities for competitor")
def get_competitor_activities(
    competitor_id: int,
    activity_type: Optional[str] = Query(None),
    importance: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve all activities associated with a specific competitor."""
    service = ActivityService(db)
    return service.get_activities(
        competitor_id=competitor_id,
        activity_type=activity_type,
        importance=importance,
        limit=limit,
    )
