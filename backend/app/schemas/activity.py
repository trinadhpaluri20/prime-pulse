from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict, Field


class ActivityBase(BaseModel):
    competitor_id: int
    activity_type: str = Field(..., json_schema_extra={"example": "pricing"})  # pricing, product, hiring, marketing, website
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    source_id: Optional[int] = None
    importance: str = Field(default="medium")  # high, medium, low
    detected_at: datetime


class ActivityCreate(ActivityBase):
    metadata_json: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    competitor_name: Optional[str] = None
    source_name: Optional[str] = None
    source_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ActivityListResponse(BaseModel):
    items: List[ActivityResponse]
    total: int


class TimelineEventHistoricalContext(BaseModel):
    summary: str
    similarCount: int
    sequence: Optional[List[Dict[str, Any]]] = None


class TimelineEventResponse(BaseModel):
    id: str
    competitor: str
    type: str
    title: str
    description: str
    fullDescription: Optional[str] = None
    timestamp: str
    dateDisplay: str
    timeDisplay: str
    importance: str
    source: str
    detectedChanges: Optional[List[str]] = None
    historicalContext: Optional[TimelineEventHistoricalContext] = None
    relatedEventIds: Optional[List[str]] = None
