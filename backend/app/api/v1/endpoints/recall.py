from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.enums import EventCategory
from app.services.recall_service import RecallService
from app.schemas.recall import (
    RecallQueryRequest,
    RecallQueryResponse,
    CompetitorHistoryResponse,
)

router = APIRouter()


@router.post(
    "/recall",
    response_model=RecallQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Recall Historical Intelligence",
    description="Query historical competitor intelligence using natural language or explicit parameters. Performs dual retrieval across structured DB records and Hindsight persistent memory.",
)
def recall_historical_intelligence(
    payload: RecallQueryRequest,
    db: Session = Depends(get_db),
) -> RecallQueryResponse:
    """Natural-language historical intelligence recall endpoint."""
    service = RecallService(db)
    return service.process_recall_query(payload)


@router.get(
    "/competitors/{competitor_id}/history",
    response_model=CompetitorHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Competitor History Timeline",
    description="Retrieve a deterministic, chronologically sorted historical event timeline for a competitor with attached Hindsight memory provenance.",
)
def get_competitor_history(
    competitor_id: int,
    start_date: Optional[datetime] = Query(default=None, description="Start date filter (ISO 8601)"),
    end_date: Optional[datetime] = Query(default=None, description="End date filter (ISO 8601)"),
    category: Optional[EventCategory] = Query(default=None, description="Event category filter"),
    limit: int = Query(default=50, ge=1, le=100, description="Max timeline events"),
    db: Session = Depends(get_db),
) -> CompetitorHistoryResponse:
    """Deterministic competitor history timeline endpoint."""
    service = RecallService(db)
    return service.get_competitor_history(
        competitor_id=competitor_id,
        start_date=start_date,
        end_date=end_date,
        category=category,
        limit=limit,
    )
