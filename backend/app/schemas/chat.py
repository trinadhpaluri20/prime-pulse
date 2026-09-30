from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    conversation_id: Optional[str] = None
    competitor_id: Optional[int] = None

    def get_query(self) -> str:
        return (self.message or self.query or "").strip()


class ChatEvidenceItem(BaseModel):
    label: str
    date: Optional[str] = None
    type: Optional[str] = None
    days_offset: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(default=0.87)
    facts: Optional[List[str]] = Field(default_factory=list)
    observations: Optional[List[str]] = Field(default_factory=list)
    citations: Optional[List[str]] = Field(default_factory=list)
    related_events: Optional[List[str]] = Field(default_factory=list)
    conversation_id: Optional[str] = None
