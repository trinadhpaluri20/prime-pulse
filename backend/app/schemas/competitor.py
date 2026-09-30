from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class CompetitorBase(BaseModel):
    """Base competitor attributes."""

    name: str = Field(..., min_length=1, max_length=255, json_schema_extra={"example": "Competitor A"})
    description: Optional[str] = Field(
        default=None, json_schema_extra={"example": "Enterprise AI intelligence provider"}
    )
    website: Optional[str] = Field(
        default=None, json_schema_extra={"example": "https://competitor-a.ai"}
    )
    status: Optional[str] = Field(
        default="active", json_schema_extra={"example": "active"}
    )
    industry: Optional[str] = Field(default=None, json_schema_extra={"example": "Enterprise AI"})


class CompetitorCreate(CompetitorBase):
    """Schema for creating a new competitor."""

    pass


class CompetitorUpdate(BaseModel):
    """Schema for updating an existing competitor."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None)
    website: Optional[str] = Field(default=None)
    status: Optional[str] = Field(default=None)
    industry: Optional[str] = Field(default=None)


class CompetitorResponse(CompetitorBase):
    """Schema for competitor response."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompetitorListResponse(BaseModel):
    """List of competitors response."""

    items: List[CompetitorResponse]
    total: int
