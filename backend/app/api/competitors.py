from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.session import get_db
from app.models.competitor import Competitor
from app.schemas.competitor import (
    CompetitorCreate,
    CompetitorUpdate,
    CompetitorResponse,
)
from app.services.competitor_service import CompetitorService

router = APIRouter(prefix="/competitors", tags=["Competitors"])


@router.get("", response_model=List[CompetitorResponse], summary="List all tracked competitors")
def list_competitors(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """Retrieve all competitors, optionally filtered by active/inactive status."""
    stmt = select(Competitor).order_by(Competitor.name)
    if status_filter:
        stmt = stmt.where(Competitor.status == status_filter.lower())
    
    competitors = db.scalars(stmt).all()
    return [CompetitorResponse.model_validate(c) for c in competitors]


@router.get("/{competitor_id}", response_model=CompetitorResponse, summary="Get competitor details")
def get_competitor(competitor_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed competitor information by ID."""
    service = CompetitorService(db)
    return service.get_competitor(competitor_id)


@router.post("", response_model=CompetitorResponse, status_code=status.HTTP_201_CREATED, summary="Create new competitor")
def create_competitor(payload: CompetitorCreate, db: Session = Depends(get_db)):
    """Register a new competitor target for intelligence tracking."""
    service = CompetitorService(db)
    return service.create_competitor(payload)


@router.put("/{competitor_id}", response_model=CompetitorResponse, summary="Update competitor")
def update_competitor(
    competitor_id: int, payload: CompetitorUpdate, db: Session = Depends(get_db)
):
    """Update competitor attributes, status, or website metadata."""
    service = CompetitorService(db)
    return service.update_competitor(competitor_id, payload)


@router.delete("/{competitor_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete competitor")
def delete_competitor(competitor_id: int, db: Session = Depends(get_db)):
    """Remove a competitor from intelligence monitoring."""
    service = CompetitorService(db)
    service.delete_competitor(competitor_id)
    return None
