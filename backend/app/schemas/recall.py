from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import EventCategory


class RecallQueryRequest(BaseModel):
    """Input payload for POST /api/v1/recall natural-language query."""

    query: str = Field(
        ...,
        min_length=1,
        json_schema_extra={"example": "What has Microsoft AI done in the last 30 days?"},
        description="Natural language question or strategic query about competitor history.",
    )
    competitor_id: Optional[int] = Field(
        default=None,
        json_schema_extra={"example": 1},
        description="Optional explicit competitor ID filter.",
    )
    start_date: Optional[datetime] = Field(
        default=None,
        description="Optional explicit start date bounds (ISO 8601).",
    )
    end_date: Optional[datetime] = Field(
        default=None,
        description="Optional explicit end date bounds (ISO 8601).",
    )
    category: Optional[EventCategory] = Field(
        default=None,
        description="Optional explicit event category filter.",
    )
    limit: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Maximum timeline events to retrieve.",
    )


class DateRangeInfo(BaseModel):
    """Resolved date range bounds."""

    start: Optional[datetime] = None
    end: Optional[datetime] = None
    expression: Optional[str] = None


class CompetitorSummaryInfo(BaseModel):
    """Resolved competitor info."""

    id: int
    name: str
    industry: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TimelineEventItem(BaseModel):
    """Chronologically ordered historical event on the recall timeline."""

    event_id: Optional[int] = None
    competitor_id: int
    competitor_name: str
    date: datetime
    category: str
    title: str
    summary: str
    importance: str = "medium"
    memory_document_id: Optional[str] = None
    source_name: Optional[str] = None
    source_type: str = Field(default="database", description="database | hindsight")

    model_config = ConfigDict(from_attributes=True)


class DetectedPatternItem(BaseModel):
    """Detected historical activity pattern or trend."""

    pattern_type: str = Field(
        ...,
        json_schema_extra={"example": "dominant_category"},
        description="Pattern classification (e.g., dominant_category, activity_acceleration, inactivity_gap)",
    )
    description: str = Field(
        ...,
        json_schema_extra={"example": "Product updates represented 60% of all activity in the last 90 days."},
    )
    supporting_event_ids: List[int] = Field(default_factory=list)


class MemoryProvenanceItem(BaseModel):
    """Provenance tracking details for recalled Hindsight memories."""

    memory_document_id: str
    event_id: Optional[int] = None
    source_type: str = Field(default="hindsight")
    relevance: str = Field(default="recalled")
    timestamp: Optional[datetime] = None
    text_snippet: Optional[str] = None


class RecallQueryResponse(BaseModel):
    """Complete historical intelligence response payload for POST /api/v1/recall."""

    query: str
    status: str = Field(
        ...,
        description="Status of response: success | missing_competitor | no_events | error",
    )
    competitor: Optional[CompetitorSummaryInfo] = None
    date_range: Optional[DateRangeInfo] = None
    category_filter: Optional[EventCategory] = None
    events: List[TimelineEventItem] = Field(default_factory=list)
    patterns: List[DetectedPatternItem] = Field(default_factory=list)
    facts: List[str] = Field(default_factory=list)
    observations: List[str] = Field(default_factory=list)
    insights: List[str] = Field(default_factory=list)
    memory_sources: List[MemoryProvenanceItem] = Field(default_factory=list)
    memory_status: str = Field(
        default="connected",
        description="Hindsight memory status: connected | unavailable | not_configured",
    )
    summary: str = Field(..., description="Concise evidence-grounded summary.")


class CompetitorHistoryResponse(BaseModel):
    """Response payload for GET /api/v1/competitors/{competitor_id}/history."""

    competitor: CompetitorSummaryInfo
    date_range: Optional[DateRangeInfo] = None
    total_events: int
    events: List[TimelineEventItem] = Field(default_factory=list)
    memory_sources: List[MemoryProvenanceItem] = Field(default_factory=list)
