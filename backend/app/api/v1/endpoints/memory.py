from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Query, status
from pydantic import BaseModel, Field
from app.services.hindsight_service import HindsightMemoryService

router = APIRouter()


class TestMemoryPayload(BaseModel):
    """Payload for dev-only memory retention test."""

    content: str = Field(
        ...,
        min_length=1,
        json_schema_extra={"example": "Competitor X slashed subscription tier pricing by 25%."},
    )
    context: Optional[str] = Field(
        default="dev_test_event",
        json_schema_extra={"example": "dev_test_event"},
    )
    document_id: Optional[str] = Field(
        default="dev-test-doc-001",
        json_schema_extra={"example": "dev-test-doc-001"},
    )
    metadata: Optional[Dict[str, str]] = Field(
        default_factory=lambda: {"environment": "development", "source": "dev_test_endpoint"}
    )


@router.post(
    "/memory/test",
    response_model=Dict[str, Any],
    status_code=status.HTTP_201_CREATED,
    summary="[DEV ONLY] Test Retain Memory",
    description="DEVELOPMENT ONLY: Test persisting a sample memory into Hindsight persistent memory.",
)
def test_retain_memory(payload: TestMemoryPayload) -> Dict[str, Any]:
    """Development-only endpoint verifying Hindsight Retain capability."""
    service = HindsightMemoryService()
    result = service.retain(
        content=payload.content,
        context=payload.context,
        document_id=payload.document_id,
        metadata=payload.metadata,
        tags=["dev_test"],
    )
    return {
        "message": "Development memory retention test executed successfully.",
        "result": result,
    }


@router.get(
    "/memory/test/recall",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="[DEV ONLY] Test Recall Memory",
    description="DEVELOPMENT ONLY: Test retrieving memories from Hindsight persistent memory using a search query.",
)
def test_recall_memory(
    q: str = Query(
        default="pricing",
        min_length=1,
        description="Search query to recall from Hindsight persistent memory",
    ),
    types: Optional[List[str]] = Query(
        default=None,
        description="Optional memory types filter: world, experience, observation",
    ),
) -> Dict[str, Any]:
    """Development-only endpoint verifying Hindsight Recall capability."""
    service = HindsightMemoryService()
    result = service.recall(query=q, types=types, limit=10)
    return {
        "message": "Development memory recall test executed successfully.",
        "query": q,
        "result": result,
    }
