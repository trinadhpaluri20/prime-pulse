from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardIntelligenceBriefResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse, summary="Executive Dashboard KPIs summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Returns top-level metric counters for competitors, changes, patterns, and active alerts."""
    service = DashboardService(db)
    return service.get_summary()


@router.get("/activity", response_model=List[Dict[str, Any]], summary="Historical activity chart dataset")
def get_dashboard_activity(
    timeframe: str = Query("6M", description="Chart timeframe: 7 days, 30 days, 6 months (or 7D, 30D, 6M)"),
    db: Session = Depends(get_db),
):
    """Returns historical multi-competitor activity volume time series for the Recharts visualization."""
    service = DashboardService(db)
    return service.get_activity_chart(timeframe)


@router.get("/brief", response_model=DashboardIntelligenceBriefResponse, summary="Executive Intelligence Brief")
def get_dashboard_brief(db: Session = Depends(get_db)):
    """Returns featured strategic intelligence synthesis and precursor pattern analysis."""
    service = DashboardService(db)
    return service.get_intelligence_brief()
