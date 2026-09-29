from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.agent_service import AgentService
from app.schemas.agent import AgentAnalysisRequest, AgentAnalysisResponse

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AgentAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Competitive Intelligence (Gemini AI Agent)",
    description="Execute memory-backed AI agent orchestration pipeline querying Hindsight persistent memory, structured relational database events, and Gemini LLM reasoning.",
)
def analyze_competitor_intelligence(
    payload: AgentAnalysisRequest,
    db: Session = Depends(get_db),
) -> AgentAnalysisResponse:
    """AI Agent Orchestration endpoint using Gemini LLM and Hindsight persistent memory."""

    service = AgentService(db)
    return service.analyze_competitor_intelligence(payload)
