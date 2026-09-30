import logging
import uuid
from typing import Optional, Dict, Any, List
from collections import OrderedDict
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.competitor import Competitor
from app.services.memory_service import MemoryService
from app.services.ai_service import AIService

logger = logging.getLogger("app.services.chat_service")


class ChatConversationMemory:
    """Thread-safe bounded in-memory store for multi-turn chat sessions."""

    def __init__(self, max_conversations: int = 100, max_turns: int = 8):
        self.max_conversations = max_conversations
        self.max_turns = max_turns
        self._sessions: OrderedDict[str, List[Dict[str, str]]] = OrderedDict()

    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        if conversation_id in self._sessions:
            self._sessions.move_to_end(conversation_id)
            return self._sessions[conversation_id]
        return []

    def append_turn(self, conversation_id: str, role: str, content: str):
        if conversation_id not in self._sessions:
            if len(self._sessions) >= self.max_conversations:
                self._sessions.popitem(last=False)
            self._sessions[conversation_id] = []

        self._sessions[conversation_id].append({"role": role, "content": content})
        if len(self._sessions[conversation_id]) > self.max_turns * 2:
            self._sessions[conversation_id] = self._sessions[conversation_id][-self.max_turns * 2:]
        self._sessions.move_to_end(conversation_id)


# Global session cache
_chat_memory = ChatConversationMemory()


class ChatService:
    """Service orchestrating AI Chat with grounded historical memory and Groq LLM reasoning."""

    def __init__(
        self,
        db: Session,
        memory_service: Optional[MemoryService] = None,
        ai_service: Optional[AIService] = None,
    ):
        self.db = db
        self.memory_service = memory_service or MemoryService(db=db)
        self.ai_service = ai_service or AIService()

    async def process_chat(
        self,
        query: str,
        conversation_id: Optional[str] = None,
        competitor_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Process natural language question, retrieve grounded historical context,

        generate evidence-backed answer, and track conversation context.
        """
        conv_id = conversation_id or str(uuid.uuid4())
        user_query = query.strip()
        logger.info(f"[CHAT_SERVICE] Processing query for conversation '{conv_id[:8]}': {user_query}")

        # 1. Resolve Competitor
        comp_name: Optional[str] = None
        if competitor_id:
            comp_obj = self.db.scalar(select(Competitor).where(Competitor.id == competitor_id))
            if comp_obj:
                comp_name = comp_obj.name

        if not comp_name:
            # Check if user mentioned any known competitor
            competitors = self.db.scalars(select(Competitor)).all()
            for c in competitors:
                if c.name.lower() in user_query.lower():
                    comp_name = c.name
                    break

        # 2. Get past conversation history for follow-up resolution
        history = _chat_memory.get_history(conv_id)

        # If competitor still not detected, check previous assistant/user turns
        if not comp_name and history:
            for past in reversed(history):
                content = past.get("content", "").lower()
                competitors = self.db.scalars(select(Competitor)).all()
                for c in competitors:
                    if c.name.lower() in content:
                        comp_name = c.name
                        break
                if comp_name:
                    break

        # Context-aware query expansion for follow-up questions (e.g. "Did that happen before?")
        effective_query = user_query
        follow_up_tokens = {"that", "this", "it", "they", "before", "again", "earlier", "previously", "same"}
        query_words = set(user_query.lower().replace("?", "").replace(".", "").split())
        if history and (query_words.intersection(follow_up_tokens) or len(query_words) < 5):
            for past_turn in reversed(history):
                past_text = past_turn.get("content", "")
                if len(past_text) > 20:
                    effective_query = f"{user_query} {past_text[:120]}"
                    break

        # 3. Retrieve Grounded Historical Context via MemoryService
        retrieval_result = await self.memory_service.retrieve_context(
            query=effective_query,
            competitor=comp_name,
            limit=8,
        )

        has_evidence = retrieval_result.get("has_evidence", False)
        formatted_context = retrieval_result.get("formatted_context", "")

        # 4. Check if query is about something with zero evidence in database
        # E.g. unknown competitor or topic with no records
        if not has_evidence and comp_name:
            no_evidence_resp = (
                f"I couldn't find enough historical evidence in the monitored data for {comp_name} "
                "to support a reliable conclusion."
            )
            _chat_memory.append_turn(conv_id, "user", user_query)
            _chat_memory.append_turn(conv_id, "assistant", no_evidence_resp)
            return {
                "answer": no_evidence_resp,
                "evidence": [],
                "confidence": 0.0,
                "facts": [],
                "observations": [],
                "citations": [],
                "related_events": [],
                "conversation_id": conv_id,
            }

        # 5. Dispatch to Groq LLM via AIService
        ai_resp = await self.ai_service.answer_chat_query(
            user_question=user_query,
            historical_context=formatted_context,
            conversation_history=history,
            competitor_name=comp_name,
        )

        answer_text = ai_resp.get("answer", "")
        facts = ai_resp.get("facts", [])
        observations = ai_resp.get("observations", [])
        raw_confidence = ai_resp.get("confidence", 0.87)
        confidence = float(raw_confidence) if isinstance(raw_confidence, (int, float)) else 0.87

        # Extract structured evidence items
        evidence_items = ai_resp.get("evidence", [])
        if not evidence_items and retrieval_result.get("events"):
            for ev in retrieval_result["events"][:4]:
                evidence_items.append({
                    "label": ev.get("title", "Historical Precedent"),
                    "date": ev.get("date", "Timeline"),
                    "type": ev.get("type", "Activity"),
                    "days_offset": -5,
                })

        related_events = ai_resp.get("related_events") or [ev.get("title", "") for ev in retrieval_result.get("events", [])[:3]]

        # Record turns in session history
        _chat_memory.append_turn(conv_id, "user", user_query)
        _chat_memory.append_turn(conv_id, "assistant", answer_text)

        citations = [f"ev-{ev.get('id', idx)}" for idx, ev in enumerate(evidence_items)]

        return {
            "answer": answer_text,
            "evidence": evidence_items,
            "confidence": confidence,
            "facts": facts,
            "observations": observations,
            "citations": citations,
            "related_events": related_events,
            "conversation_id": conv_id,
        }
