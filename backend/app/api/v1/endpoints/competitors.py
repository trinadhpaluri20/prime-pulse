from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.competitor_service import CompetitorService
from app.schemas.competitor import (
    CompetitorCreate,
    CompetitorUpdate,
    CompetitorResponse,
    CompetitorListResponse,
)

router = APIRouter()


@router.post(
    "/competitors",
    response_model=CompetitorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Competitor",
    description="Register a new competitor entity to track.",
)
def create_competitor(
    payload: CompetitorCreate,
    db: Session = Depends(get_db),
) -> CompetitorResponse:
    service = CompetitorService(db)
    return service.create_competitor(payload)


@router.get(
    "/competitors",
    response_model=CompetitorListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Competitors",
    description="Retrieve a paginated list of tracked competitors.",
)
def list_competitors(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
) -> CompetitorListResponse:
    service = CompetitorService(db)
    return service.list_competitors(page=page, page_size=page_size)


@router.get(
    "/competitors/{competitor_id}",
    response_model=CompetitorResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Competitor",
    description="Fetch a specific competitor by ID.",
)
def get_competitor(
    competitor_id: int,
    db: Session = Depends(get_db),
) -> CompetitorResponse:
    service = CompetitorService(db)
    return service.get_competitor(competitor_id)


@router.put(
    "/competitors/{competitor_id}",
    response_model=CompetitorResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Competitor",
    description="Update fields of an existing competitor.",
)
def update_competitor(
    competitor_id: int,
    payload: CompetitorUpdate,
    db: Session = Depends(get_db),
) -> CompetitorResponse:
    service = CompetitorService(db)
    return service.update_competitor(competitor_id, payload)


@router.delete(
    "/competitors/{competitor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Competitor",
    description="Delete a competitor entity and cascade delete associated events.",
)
def delete_competitor(
    competitor_id: int,
    db: Session = Depends(get_db),
) -> None:
    service = CompetitorService(db)
    service.delete_competitor(competitor_id)
