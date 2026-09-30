from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.insight import (
    InsightResponse,
    InsightEvidenceResponse,
)
from app.services.insight_service import InsightService

router = APIRouter(prefix="/insights", tags=["Insights"])


class GenerateInsightRequest(BaseModel):
    competitor: str
    activity_type: Optional[str] = None


@router.get("", response_model=List[InsightResponse], summary="List AI strategic insights")
def list_insights(
    insight_type: Optional[str] = Query(None, alias="type", description="Insight type: pattern, trend, unusual, historical"),
    competitor: Optional[str] = Query(None, description="Competitor name filter"),
    priority: Optional[str] = Query(None, description="Priority filter: high, medium, low"),
    search: Optional[str] = Query(None, description="Search term in title or description"),
    db: Session = Depends(get_db),
):
    """Retrieve synthesized strategic insights with confidence scores and evidence counts."""
    service = InsightService(db)
    return service.get_insights(
        insight_type=insight_type,
        competitor=competitor,
        priority=priority,
        search=search,
    )


@router.get("/{insight_id}", response_model=InsightResponse, summary="Get single insight details")
def get_insight(insight_id: int, db: Session = Depends(get_db)):
    """Fetch insight detail by ID."""
    service = InsightService(db)
    return service.get_insight_by_id(insight_id)


@router.get("/{insight_id}/evidence", response_model=InsightEvidenceResponse, summary="Get historical evidence supporting insight")
def get_insight_evidence(insight_id: int, db: Session = Depends(get_db)):
    """Retrieve the multi-event historical sequence and observed evidence that validates this insight."""
    service = InsightService(db)
    return service.get_insight_evidence(insight_id)


@router.post("/generate", summary="Generate live AI strategic insight")
async def generate_insight(
    payload: GenerateInsightRequest,
    db: Session = Depends(get_db),
):
    """Generate live grounded AI strategic insight using Groq and historical memory."""
    service = InsightService(db)
    return await service.generate_live_insight(
        competitor_name=payload.competitor,
        activity_type=payload.activity_type,
    )
