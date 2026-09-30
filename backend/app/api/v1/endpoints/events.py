from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.event_service import EventService
from app.schemas.event import (
    CompetitorEventCreate,
    CompetitorEventUpdate,
    CompetitorEventResponse,
    CompetitorEventListResponse,
)

router = APIRouter()


@router.get(
    "/events",
    response_model=List[CompetitorEventResponse],
    status_code=status.HTTP_200_OK,
    summary="Search & List All Competitor Events",
    description="Retrieve events across all competitors, filterable by category, competitor_id, keyword, limit, sort_order.",
)
def list_all_events(
    competitor_id: Optional[int] = Query(default=None, description="Filter by competitor ID"),
    category: Optional[str] = Query(default=None, description="Filter by event category"),
    keyword: Optional[str] = Query(default=None, description="Filter by keyword"),
    limit: int = Query(default=100, ge=1, le=500, description="Max number of items"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$", description="Sort order by date"),
    db: Session = Depends(get_db),
) -> List[CompetitorEventResponse]:
    service = EventService(db)
    events = service.search_all_events(
        competitor_id=competitor_id,
        category=category,
        keyword=keyword,
        limit=limit,
        sort_order=sort_order,
    )
    return [CompetitorEventResponse.model_validate(e) for e in events]


@router.post(
    "/competitors/{competitor_id}/events",
    response_model=CompetitorEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Competitor Event (Dual Persistence)",
    description="Record a new market event in the relational database and push its memory to Hindsight persistent memory.",
)
def create_competitor_event(
    competitor_id: int,
    payload: CompetitorEventCreate,
    db: Session = Depends(get_db),
) -> CompetitorEventResponse:
    service = EventService(db)
    return service.create_event(competitor_id, payload)


@router.get(
    "/competitors/{competitor_id}/events",
    response_model=CompetitorEventListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Competitor Events",
    description="Retrieve paginated events for a specific competitor, sorted by event_date.",
)
def list_competitor_events(
    competitor_id: int,
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$", description="Sort order by event_date"),
    db: Session = Depends(get_db),
) -> CompetitorEventListResponse:
    service = EventService(db)
    return service.list_competitor_events(
        competitor_id=competitor_id,
        page=page,
        page_size=page_size,
        sort_order=sort_order,
    )


@router.get(
    "/events/{event_id}",
    response_model=CompetitorEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Event",
    description="Fetch a specific competitor event by ID.",
)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
) -> CompetitorEventResponse:
    service = EventService(db)
    return service.get_event(event_id)


@router.put(
    "/events/{event_id}",
    response_model=CompetitorEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Event",
    description="Update fields of an existing competitor event and sync memory to Hindsight.",
)
def update_event(
    event_id: int,
    payload: CompetitorEventUpdate,
    db: Session = Depends(get_db),
) -> CompetitorEventResponse:
    service = EventService(db)
    return service.update_event(event_id, payload)


@router.post(
    "/events/{event_id}/sync-memory",
    response_model=CompetitorEventResponse,
    status_code=status.HTTP_200_OK,
    summary="Sync Event Memory",
    description="Manually trigger or retry Hindsight memory retention for an existing competitor event.",
)
def sync_event_memory(
    event_id: int,
    db: Session = Depends(get_db),
) -> CompetitorEventResponse:
    service = EventService(db)
    return service.sync_event_memory(event_id)


@router.delete(
    "/events/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Event",
    description="Delete a competitor event.",
)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
) -> None:
    service = EventService(db)
    service.delete_event(event_id)
