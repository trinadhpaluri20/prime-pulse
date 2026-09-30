import json
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, or_, desc

from app.models.insight import Insight
from app.models.competitor import Competitor
from app.models.activity import Activity
from app.schemas.insight import (
    InsightCreate,
    InsightResponse,
    InsightEvidenceResponse,
)
from app.services.memory_service import MemoryService
from app.services.ai_service import AIService
from app.utils.errors import NotFoundError

logger = logging.getLogger("app.services.insight_service")


class InsightService:
    """Business logic service for managing and generating AI Strategic Insights

    grounded in historical memory and Groq LLM pattern recognition.
    """

    def __init__(
        self,
        db: Session,
        memory_service: Optional[MemoryService] = None,
        ai_service: Optional[AIService] = None,
    ):
        self.db = db
        self.memory_service = memory_service or MemoryService(db=db)
        self.ai_service = ai_service or AIService()

    def get_insights(
        self,
        insight_type: Optional[str] = None,
        competitor: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
    ) -> List[InsightResponse]:
        """Fetch insights with multi-attribute filtering."""
        stmt = (
            select(Insight)
            .options(joinedload(Insight.competitor))
            .order_by(desc(Insight.created_at))
        )

        conditions = []
        if insight_type and insight_type.lower() not in ("all", "all insights"):
            conditions.append(Insight.type.ilike(insight_type))
        if competitor and competitor.lower() not in ("all", "all competitors"):
            conditions.append(
                Insight.competitor.has(Competitor.name.ilike(f"%{competitor}%"))
            )
        if priority and priority.lower() != "all":
            conditions.append(Insight.priority.ilike(priority))
        if search:
            search_clause = or_(
                Insight.title.ilike(f"%{search}%"),
                Insight.description.ilike(f"%{search}%"),
            )
            conditions.append(search_clause)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        insights = self.db.scalars(stmt.limit(limit)).unique().all()

        results = []
        for ins in insights:
            comp_name = ins.competitor.name if ins.competitor else "Cross-Competitor / Market"
            
            parsed_details = None
            pattern_flow = None
            if ins.evidence_data:
                try:
                    data = json.loads(ins.evidence_data)
                    parsed_details = data.get("evidenceDetails") or data
                    pattern_flow = data.get("detectedPatternFlow")
                except Exception:
                    pass

            results.append(
                InsightResponse(
                    id=ins.id,
                    type=ins.type,
                    title=ins.title,
                    description=ins.description,
                    competitor_id=ins.competitor_id,
                    competitor_name=comp_name,
                    competitor=comp_name,
                    confidence=ins.confidence,
                    evidence_count=ins.evidence_count,
                    evidenceCount=ins.evidence_count,
                    historicalMatches=ins.evidence_count,
                    priority=ins.priority,
                    timeframe_days=ins.timeframe_days,
                    timeframeDays=ins.timeframe_days,
                    detectedPatternFlow=pattern_flow,
                    isFeatured=(ins.priority.lower() == "high" and ins.id == 1),
                    evidenceDetails=parsed_details,
                    created_at=ins.created_at,
                    updated_at=ins.updated_at,
                )
            )
        return results

    def get_insight_by_id(self, insight_id: int) -> InsightResponse:
        """Fetch single insight by ID."""
        stmt = (
            select(Insight)
            .options(joinedload(Insight.competitor))
            .where(Insight.id == insight_id)
        )
        ins = self.db.scalar(stmt)
        if not ins:
            raise NotFoundError("Insight", insight_id)

        comp_name = ins.competitor.name if ins.competitor else "Cross-Competitor / Market"
        parsed_details = None
        pattern_flow = None
        if ins.evidence_data:
            try:
                data = json.loads(ins.evidence_data)
                parsed_details = data.get("evidenceDetails") or data
                pattern_flow = data.get("detectedPatternFlow")
            except Exception:
                pass

        return InsightResponse(
            id=ins.id,
            type=ins.type,
            title=ins.title,
            description=ins.description,
            competitor_id=ins.competitor_id,
            competitor_name=comp_name,
            competitor=comp_name,
            confidence=ins.confidence,
            evidence_count=ins.evidence_count,
            evidenceCount=ins.evidence_count,
            historicalMatches=ins.evidence_count,
            priority=ins.priority,
            timeframe_days=ins.timeframe_days,
            timeframeDays=ins.timeframe_days,
            detectedPatternFlow=pattern_flow,
            isFeatured=(ins.priority.lower() == "high" and ins.id == 1),
            evidenceDetails=parsed_details,
            created_at=ins.created_at,
            updated_at=ins.updated_at,
        )

    def get_insight_evidence(self, insight_id: int) -> InsightEvidenceResponse:
        """Fetch supporting historical evidence, sequence relationships, and analytical rationale for an insight."""
        ins = self.get_insight_by_id(insight_id)

        supporting_events: List[Dict[str, Any]] = []
        if ins.competitor_id:
            acts = (
                self.db.scalars(
                    select(Activity)
                    .where(Activity.competitor_id == ins.competitor_id)
                    .order_by(desc(Activity.detected_at))
                    .limit(5)
                )
                .all()
            )
            for a in acts:
                supporting_events.append(
                    {
                        "id": f"ev-{a.id}",
                        "title": a.title,
                        "date": a.detected_at.strftime("%b %d, %Y"),
                        "type": a.activity_type.capitalize(),
                        "importance": a.importance,
                        "description": a.description,
                    }
                )

        return InsightEvidenceResponse(
            insight_id=ins.id,
            title=ins.title,
            competitor_name=ins.competitor_name,
            confidence=ins.confidence,
            evidence_count=ins.evidence_count,
            evidence_details=ins.evidenceDetails,
            supporting_events=supporting_events,
        )

    async def generate_live_insight(
        self,
        competitor_name: str,
        activity_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate a live structured AI insight grounded in historical evidence."""
        logger.info(f"[INSIGHT_SERVICE] Generating live intelligence for {competitor_name}")

        # 1. Retrieve historical context
        retrieval = await self.memory_service.retrieve_context(
            query=f"{competitor_name} {activity_type or ''}".strip(),
            competitor=competitor_name,
            activity_type=activity_type,
            limit=8,
        )

        formatted_context = retrieval.get("formatted_context", "")

        # 2. Analyze pattern with Groq LLM
        analysis = await self.ai_service.analyze_competitor_pattern(
            competitor=competitor_name,
            historical_context=formatted_context,
            current_activity=activity_type,
        )

        return analysis
