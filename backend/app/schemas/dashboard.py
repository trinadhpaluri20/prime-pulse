from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DashboardSummaryResponse(BaseModel):
    competitors_tracked: int = Field(default=4)
    changes_detected: int = Field(default=32)
    patterns_detected: int = Field(default=7)
    active_alerts: int = Field(default=5)


class ActivityChartDataPoint(BaseModel):
    period: str
    competitor_a: int = Field(default=0, alias="Competitor A")
    competitor_b: int = Field(default=0, alias="Competitor B")
    competitor_c: int = Field(default=0, alias="Competitor C")
    competitor_d: Optional[int] = Field(default=0, alias="Competitor D")

    class Config:
        populate_by_name = True


class DashboardActivityChartResponse(BaseModel):
    timeframe: str
    data: List[Dict[str, Any]]


class DashboardIntelligenceBriefResponse(BaseModel):
    title: str
    supportingText: str
    intelligence: str
    patternLabel: str
    confidenceScore: int
    historicalEventsCount: int
