from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import EventCategory, EventImportance, SourceType


class EventSourceBase(BaseModel):
    """Base event source attributes."""

    name: str = Field(..., min_length=1, max_length=255, json_schema_extra={"example": "Company Press Release"})
    url: Optional[str] = Field(default=None, json_schema_extra={"example": "https://news.example.com/pr1"})
    source_type: SourceType = Field(default=SourceType.USER_ENTERED)
    published_at: Optional[datetime] = Field(default=None)


class EventSourceCreate(EventSourceBase):
    """Schema for creating an event source."""

    pass


class EventSourceResponse(EventSourceBase):
    """Schema for event source response."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompetitorEventBase(BaseModel):
    """Base competitor event attributes."""

    category: EventCategory = Field(..., json_schema_extra={"example": EventCategory.PRODUCT})
    title: str = Field(..., min_length=1, max_length=255, json_schema_extra={"example": "Launched AI Assistant v2.0"})
    description: str = Field(..., min_length=1, json_schema_extra={"example": "Announced major product overhaul adding automated workflows."})
    event_date: datetime = Field(..., json_schema_extra={"example": "2026-09-28T00:00:00Z"})
    previous_value: Optional[str] = Field(default=None, json_schema_extra={"example": "v1.5 API only"})
    new_value: Optional[str] = Field(default=None, json_schema_extra={"example": "v2.0 Autonomous Agent"})
    importance: EventImportance = Field(default=EventImportance.MEDIUM)


class CompetitorEventCreate(CompetitorEventBase):
    """Schema for creating a competitor event."""

    source: Optional[EventSourceCreate] = Field(default=None)


class CompetitorEventUpdate(BaseModel):
    """Schema for updating a competitor event."""

    category: Optional[EventCategory] = Field(default=None)
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, min_length=1)
    event_date: Optional[datetime] = Field(default=None)
    previous_value: Optional[str] = Field(default=None)
    new_value: Optional[str] = Field(default=None)
    importance: Optional[EventImportance] = Field(default=None)
    source_id: Optional[int] = Field(default=None)


class MemoryStatusResponse(BaseModel):
    """Status details for Hindsight memory retention."""

    status: str = Field(
        ..., json_schema_extra={"example": "retained"},
        description="Retention status: retained | not_configured | failed | skipped"
    )
    document_id: Optional[str] = Field(
        default=None, json_schema_extra={"example": "event-1-5"},
        description="Deterministic Hindsight document ID"
    )
    bank_id: Optional[str] = Field(
        default=None, json_schema_extra={"example": "competitive-intelligence"}
    )
    error: Optional[str] = Field(default=None, description="Error message if retention failed")


class CompetitorEventResponse(CompetitorEventBase):
    """Schema for competitor event response."""

    id: int
    competitor_id: int
    source_id: Optional[int] = Field(default=None)
    source: Optional[EventSourceResponse] = Field(default=None)
    created_at: datetime
    updated_at: datetime
    memory: Optional[MemoryStatusResponse] = Field(
        default=None, description="Hindsight persistent memory retention status"
    )

    model_config = ConfigDict(from_attributes=True)


class CompetitorEventWithMemoryResponse(BaseModel):
    """Explicit response schema combining structured DB event and Hindsight memory status."""

    event: CompetitorEventResponse
    memory: MemoryStatusResponse


class CompetitorEventListResponse(BaseModel):
    """Paginated list of competitor events."""

    items: List[CompetitorEventResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
