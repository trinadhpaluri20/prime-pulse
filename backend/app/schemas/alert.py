from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class AlertBase(BaseModel):
    competitor_id: int
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    priority: str = Field(default="medium")  # high, medium, low
    alert_type: str = Field(default="pattern")  # activity_spike, pattern, pricing, product, website, hiring, marketing
    historical_evidence_count: int = Field(default=0, ge=0)
    why_it_matters: Optional[str] = None
    observation_fact: Optional[str] = None
    interpretation: Optional[str] = None
    possible_signal: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertReadUpdate(BaseModel):
    is_read: bool = True


class AlertResponse(AlertBase):
    id: int
    is_read: bool
    competitor_name: Optional[str] = None
    competitor: Optional[str] = None
    type: Optional[str] = None
    read: Optional[bool] = None
    detectedDisplay: Optional[str] = None
    timestamp: Optional[str] = None
    whyItMatters: Optional[str] = None
    historicalEvidenceCount: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertListResponse(BaseModel):
    items: List[AlertResponse]
    total: int
    unread_count: int
