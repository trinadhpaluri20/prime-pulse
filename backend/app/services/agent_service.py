import logging
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.enums import EventCategory
from app.repositories.event_repository import EventRepository
from app.services.recall_service import RecallService
from app.services.gemini_service import GeminiService
from app.services.grok_service import GrokService
from app.schemas.recall import (
    RecallQueryRequest,
    RecallQueryResponse,
    TimelineEventItem,
    MemoryProvenanceItem,
    CompetitorHistoryResponse,
)
from app.schemas.agent import AgentAnalysisRequest, AgentAnalysisResponse
from app.utils.errors import ValidationErrorException, NotFoundError

logger = logging.getLogger("app.services.agent_service")


class AgentService:
    """AI Agent Orchestration Service coordinating query parsing, tool execution (Recall & Hindsight),
    evidence context formatting, Gemini LLM reasoning, and structured provenance assembly.
    """

    def __init__(
        self,
        db: Session,
        recall_service: Optional[RecallService] = None,
        gemini_service: Optional[GeminiService] = None,
        grok_service: Optional[GrokService] = None,
    ):
        self.db = db
        self.recall_service = recall_service or RecallService(db)
        self.gemini_service = gemini_service or GeminiService()
        self.grok_service = grok_service
        self.event_repository = EventRepository(db)

    # =========================================================================
    # AGENT TOOLS
    # =========================================================================

    def tool_retrieve_historical_context(
        self,
        query: str,
        competitor_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[EventCategory] = None,
        limit: int = 20,
    ) -> RecallQueryResponse:
        """TOOL 1: Retrieve historical context and persistent memories via Phase 5 Recall Engine."""
        req = RecallQueryRequest(
            query=query,
            competitor_id=competitor_id,
            start_date=start_date,
            end_date=end_date,
            category=category,
            limit=limit,
        )
        return self.recall_service.process_recall_query(req)

    def tool_get_competitor_history(
        self,
        competitor_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[EventCategory] = None,
        limit: int = 50,
    ) -> CompetitorHistoryResponse:
        """TOOL 2: Retrieve deterministic competitor historical timeline and memory provenance."""
        return self.recall_service.get_competitor_history(
            competitor_id=competitor_id,
            start_date=start_date,
            end_date=end_date,
            category=category,
            limit=limit,
        )

    def tool_get_competitor_events(
        self,
        competitor_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[str] = None,
        keyword: Optional[str] = None,
        limit: int = 50,
    ):
        """TOOL 3: Search raw structured competitor database events."""
        return self.event_repository.search_events(
            competitor_id=competitor_id,
            start_date=start_date,
            end_date=end_date,
            category=category,
            keyword=keyword,
            limit=limit,
        )

    # =========================================================================
    # MAIN AGENT ORCHESTRATION PIPELINE
    # =========================================================================

    def analyze_competitor_intelligence(
        self, request: AgentAnalysisRequest
    ) -> AgentAnalysisResponse:
        """Main AI Agent Orchestration workflow:

        1. Validate query input
        2. Execute Tool 1 (Recall Engine) to perform dual retrieval (DB + Hindsight)
        3. Handle missing competitor or zero records
        4. Normalize evidence context into structured payload for Gemini
        5. Invoke Gemini LLM with strict evidence grounding system prompt
        6. Attach memory provenance citations and return structured analysis
        """
        logger.info(f"[AGENT_ORCHESTRATOR] Starting analysis workflow for query: '{request.query}'")

        if not request.query or not request.query.strip():
            raise ValidationErrorException("Query text cannot be empty.")

        # Step 1: Execute Recall Tool (Phase 5 Engine)
        recall_res = self.tool_retrieve_historical_context(
            query=request.query,
            competitor_id=request.competitor_id,
            start_date=request.start_date,
            end_date=request.end_date,
            category=request.category,
        )

        # Step 2: Check missing competitor
        if recall_res.status == "missing_competitor":
            logger.info("[AGENT_ORCHESTRATOR] Competitor could not be resolved from query.")
            return AgentAnalysisResponse(
                query=request.query,
                status="missing_competitor",
                summary=recall_res.summary,
                memory_status=recall_res.memory_status,
                gemini_status="connected" if self.gemini_service.is_configured else "not_configured",
                grok_status="connected" if self.gemini_service.is_configured else "not_configured",
                limitations=["Could not resolve target competitor entity from query text or parameters."],
            )

        # Step 3: Format Evidence Context for Gemini LLM
        comp_name = recall_res.competitor.name if recall_res.competitor else "Unknown Competitor"
        evidence_context_str = self._build_evidence_context(comp_name, recall_res)

        # Step 4: Construct Gemini System Prompt
        system_prompt = self._build_system_prompt()

        # Step 5: Invoke Gemini LLM with Graceful Resilience
        gemini_status = "connected"
        analysis_status = "success"
        limitations: List[str] = []

        llm_result: Dict[str, Any] = {}

        if not self.gemini_service.is_configured:
            logger.warning("[AGENT_ORCHESTRATOR] Gemini LLM is not configured (GEMINI_API_KEY missing). Falling back to recall evidence engine.")
            gemini_status = "not_configured"
            analysis_status = "degraded"
            limitations.append("GEMINI_API_KEY is not configured in environment. Analysis compiled via Phase 5 evidence engine.")
            llm_result = self._fallback_analysis(recall_res)
        else:
            try:
                user_prompt = f"Query: {request.query}\n\nRetrieved Evidence Context:\n{evidence_context_str}"
                llm_result = self.gemini_service.generate_analysis(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                )
                logger.info("[AGENT_ORCHESTRATOR] Gemini reasoning analysis successfully generated.")
            except Exception as err:
                logger.warning(f"[AGENT_ORCHESTRATOR] Gemini API call failed: {str(err)}. Falling back to recall evidence engine.")
                gemini_status = "unavailable"
                analysis_status = "degraded"
                limitations.append(f"Gemini LLM service execution failed ({str(err)}). Analysis compiled via Phase 5 evidence engine.")
                llm_result = self._fallback_analysis(recall_res)

        # Step 6: Extract & Format Output
        summary = llm_result.get("summary") or recall_res.summary
        facts = llm_result.get("facts") or recall_res.facts
        observations = llm_result.get("observations") or recall_res.observations
        insights = llm_result.get("insights") or recall_res.insights
        extra_limitations = llm_result.get("limitations") or []
        if isinstance(extra_limitations, list):
            limitations.extend(extra_limitations)

        if not recall_res.events:
            limitations.append("No historical competitor events found in specified date range.")

        return AgentAnalysisResponse(
            query=request.query,
            status=analysis_status,
            competitor=recall_res.competitor,
            date_range=recall_res.date_range,
            summary=summary,
            facts=facts,
            observations=observations,
            insights=insights,
            evidence=recall_res.events,
            memory_sources=recall_res.memory_sources,
            memory_status=recall_res.memory_status,
            gemini_status=gemini_status,
            grok_status=gemini_status,
            limitations=limitations,
        )

    def _build_evidence_context(self, competitor_name: str, recall_res: RecallQueryResponse) -> str:
        """Construct structured narrative text containing all retrieved events and Hindsight memories for Gemini context."""
        lines = [
            f"TARGET COMPETITOR: {competitor_name}",
            f"DATE RANGE EXPRESSION: {recall_res.date_range.expression if recall_res.date_range else 'N/A'}",
            f"RECORDS FOUND: {len(recall_res.events)} historical events",
            "",
            "--- RETRIEVED HISTORICAL EVENTS (DATABASE & HINDSIGHT) ---",
        ]

        if not recall_res.events:
            lines.append("No historical events recorded for this competitor in the specified timeframe.")
        else:
            for idx, ev in enumerate(recall_res.events, 1):
                date_str = ev.date.strftime("%Y-%m-%d") if hasattr(ev.date, "strftime") else str(ev.date)[:10]
                lines.append(
                    f"[{idx}] Event ID: {ev.event_id or 'N/A'} | Date: {date_str} | Category: {ev.category} | Importance: {ev.importance}\n"
                    f"    Title: {ev.title}\n"
                    f"    Description: {ev.summary}\n"
                    f"    Memory Document ID: {ev.memory_document_id or 'N/A'}\n"
                    f"    Source: {ev.source_name or 'N/A'}"
                )

        lines.append("\n--- RETRIEVED HINDSIGHT MEMORY PROVENANCE ---")
        if not recall_res.memory_sources:
            lines.append("No memory provenance items retrieved.")
        else:
            for m in recall_res.memory_sources:
                lines.append(
                    f"- Memory Document ID: {m.memory_document_id} | Event ID: {m.event_id or 'N/A'} | Relevance: {m.relevance}"
                )

        lines.append("\n--- AUTOMATED PATTERN SIGNALS ---")
        if not recall_res.patterns:
            lines.append("No historical activity patterns detected.")
        else:
            for p in recall_res.patterns:
                lines.append(f"- Pattern ({p.pattern_type}): {p.description}")

        return "\n".join(lines)

    def _build_system_prompt(self) -> str:
        """Construct strict Gemini System Prompt enforcing evidence grounding, fact/observation/insight breakdown,
        and prohibition of hallucinated competitor facts.
        """
        return (
            "You are a Senior AI Competitive Intelligence Analyst.\n"
            "Analyze the provided competitor historical evidence and answer the user query.\n\n"
            "STRICT GROUNDING RULES:\n"
            "1. Base all facts, observations, and insights strictly on the provided evidence context.\n"
            "2. DO NOT invent, assume, or fabricate competitor events, dates, pricing, products, or claims.\n"
            "3. If the evidence is insufficient to answer the query reliably, state it explicitly under 'limitations'.\n"
            "4. Format your output strictly as a valid JSON object with the following keys:\n"
            "   - 'summary': String executive summary of competitor actions and trajectory.\n"
            "   - 'facts': Array of strings representing verifiable facts from evidence (prefix with 'FACT [Date]:').\n"
            "   - 'observations': Array of strings representing patterns derived from facts (prefix with 'OBSERVATION:').\n"
            "   - 'insights': Array of strings representing reasoned strategic interpretations (prefix with 'INSIGHT:').\n"
            "   - 'limitations': Array of strings describing data constraints or evidence limitations.\n"
        )

    def _fallback_analysis(self, recall_res: RecallQueryResponse) -> Dict[str, Any]:
        """Fallback analysis generator when Gemini is unconfigured or unavailable."""
        return {
            "summary": recall_res.summary,
            "facts": recall_res.facts,
            "observations": recall_res.observations,
            "insights": recall_res.insights,
            "limitations": [],
        }
