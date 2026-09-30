from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class SourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    url: Optional[str] = Field(default=None)
    source_type: str = Field(default="website")  # website, product_page, careers, news, social, other


class SourceCreate(SourceBase):
    pass


class SourceResponse(SourceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SourceListResponse(BaseModel):
    items: List[SourceResponse]
    total: int
