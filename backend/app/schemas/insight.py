from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class InsightBase(BaseModel):
    type: str = Field(..., json_schema_extra={"example": "pattern"})  # pattern, trend, unusual, historical
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    competitor_id: Optional[int] = None
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    evidence_count: int = Field(default=1, ge=0)
    priority: str = Field(default="medium")  # high, medium, low
    timeframe_days: int = Field(default=30)


class InsightCreate(InsightBase):
    evidence_data: Optional[str] = None


class InsightResponse(InsightBase):
    id: int
    competitor_name: Optional[str] = None
    competitor: Optional[str] = None
    evidenceCount: Optional[int] = None
    historicalMatches: Optional[int] = None
    timeframeDays: Optional[int] = None
    detectedPatternFlow: Optional[List[str]] = None
    isFeatured: Optional[bool] = False
    evidenceDetails: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InsightEvidenceResponse(BaseModel):
    insight_id: int
    title: str
    competitor_name: Optional[str] = None
    confidence: float
    evidence_count: int
    evidence_details: Optional[Dict[str, Any]] = None
    supporting_events: List[Dict[str, Any]] = Field(default_factory=list)
