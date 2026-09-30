import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ChatService

logger = logging.getLogger("app.api.chat")
router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse, summary="Grounded AI Strategic Intelligence Chat")
async def send_chat_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    """Process natural-language executive queries using grounded historical memory

    and Groq LLM reasoning. Distinguishes confirmed observations from AI interpretations.
    """
    user_query = payload.get_query()
    logger.info(f"[API_CHAT] Received query: '{user_query}' | Conversation: '{payload.conversation_id}'")

    service = ChatService(db=db)
    result = await service.process_chat(
        query=user_query,
        conversation_id=payload.conversation_id,
        competitor_id=payload.competitor_id,
    )

    return ChatResponse(
        answer=result.get("answer", ""),
        evidence=result.get("evidence", []),
        confidence=result.get("confidence", 0.87),
        facts=result.get("facts", []),
        observations=result.get("observations", []),
        citations=result.get("citations", []),
        related_events=result.get("related_events", []),
        conversation_id=result.get("conversation_id"),
    )
