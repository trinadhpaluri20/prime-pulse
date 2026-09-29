import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.competitor import Competitor
from app.models.competitor_event import CompetitorEvent
from app.models.enums import EventCategory
from app.repositories.competitor_repository import CompetitorRepository
from app.repositories.event_repository import EventRepository
from app.services.hindsight_service import HindsightMemoryService
from app.utils.query_parser import parse_date_range, extract_competitor_name, extract_event_category
from app.schemas.recall import (
    RecallQueryRequest,
    RecallQueryResponse,
    CompetitorSummaryInfo,
    DateRangeInfo,
    TimelineEventItem,
    DetectedPatternItem,
    MemoryProvenanceItem,
    CompetitorHistoryResponse,
)
from app.utils.errors import NotFoundError, ValidationErrorException

logger = logging.getLogger("app.services.recall_service")


class RecallService:
    """Historical Intelligence & Recall Engine for competitive intelligence events and Hindsight persistent memory."""

    def __init__(
        self,
        db: Session,
        hindsight_service: Optional[HindsightMemoryService] = None,
    ):
        self.db = db
        self.event_repository = EventRepository(db)
        self.competitor_repository = CompetitorRepository(db)
        self.hindsight_service = hindsight_service or HindsightMemoryService()

    def process_recall_query(self, request: RecallQueryRequest) -> RecallQueryResponse:
        """Process natural-language historical query, perform dual retrieval (DB + Hindsight),

        deduplicate, sort timeline chronologically, detect patterns, and return evidence-grounded intelligence.
        """
        logger.info(f"[RECALL] query_received: '{request.query}'")

        # Step 1: Validate date range parameters if explicitly provided
        if request.start_date and request.end_date:
            if request.start_date > request.end_date:
                raise ValidationErrorException("Start date cannot be after end date.")

        # Step 2: Resolve competitor
        resolved_competitor = self._resolve_competitor(
            competitor_id=request.competitor_id,
            query=request.query,
        )

        if resolved_competitor:
            logger.info(
                f"[RECALL] competitor_resolved: ID {resolved_competitor.id} ('{resolved_competitor.name}')"
            )
        else:
            # If a specific competitor could not be resolved from ID or query text
            all_competitors, _ = self.competitor_repository.get_all(limit=100)
            available_names = [c.name for c in all_competitors]
            avail_str = ", ".join(f"'{name}'" for name in available_names) if available_names else "None registered"

            logger.info("[RECALL] competitor_not_resolved")
            return RecallQueryResponse(
                query=request.query,
                status="missing_competitor",
                summary=f"Could not identify a specific competitor from your query. Please specify a competitor name (e.g. {avail_str}) or pass competitor_id.",
                memory_status="connected" if self.hindsight_service.is_configured else "not_configured",
            )

        # Step 3: Resolve date range
        start_date = request.start_date
        end_date = request.end_date
        expr_text = None

        if not start_date and not end_date:
            parsed_start, parsed_end, parsed_expr = parse_date_range(request.query)
            if parsed_start or parsed_end:
                start_date = parsed_start
                end_date = parsed_end
                expr_text = parsed_expr

        date_range_info = None
        if start_date or end_date:
            date_range_info = DateRangeInfo(
                start=start_date,
                end=end_date,
                expression=expr_text or "custom date range",
            )
            logger.info(f"[RECALL] date_range_resolved: start={start_date}, end={end_date}")

        # Step 4: Resolve category filter
        category_enum = request.category or extract_event_category(request.query)
        category_str = category_enum.value if category_enum else None

        # Step 5: Dual Retrieval - Relational DB
        db_events = self.event_repository.search_events(
            competitor_id=resolved_competitor.id,
            start_date=start_date,
            end_date=end_date,
            category=category_str,
            limit=request.limit,
            sort_order="asc",
        )
        logger.info(f"[RECALL] database_events_retrieved: count={len(db_events)}")

        # Step 6: Dual Retrieval - Hindsight Persistent Memory
        hindsight_memories: List[Dict[str, Any]] = []
        memory_status = "connected"

        if not self.hindsight_service.is_configured:
            memory_status = "not_configured"
        else:
            try:
                memory_result = self.hindsight_service.recall(
                    query=request.query,
                    limit=request.limit,
                )
                hindsight_memories = memory_result.get("results", [])
                logger.info(f"[RECALL] hindsight_memories_retrieved: count={len(hindsight_memories)}")
            except Exception as err:
                logger.warning(f"[RECALL] Hindsight memory recall failed: {str(err)}")
                memory_status = "unavailable"

        # Step 7: Deduplicate & Merge DB events + Hindsight memories
        timeline_events, memory_provenance = self._merge_and_deduplicate(
            competitor=resolved_competitor,
            db_events=db_events,
            hindsight_memories=hindsight_memories,
        )
        logger.info(f"[RECALL] events_deduplicated: final_count={len(timeline_events)}")

        # Step 8: Detect Historical Patterns
        patterns = self._detect_patterns(timeline_events)
        logger.info(f"[RECALL] patterns_detected: count={len(patterns)}")

        # Step 9: Formulate Evidence-Grounded Response (Facts, Observations, Insights)
        facts, observations, insights, summary_str = self._generate_evidence(
            competitor_name=resolved_competitor.name,
            events=timeline_events,
            patterns=patterns,
            date_range_expr=expr_text,
        )

        logger.info("[RECALL] response_generated")

        return RecallQueryResponse(
            query=request.query,
            status="success",
            competitor=CompetitorSummaryInfo.model_validate(resolved_competitor),
            date_range=date_range_info,
            category_filter=category_enum,
            events=timeline_events,
            patterns=patterns,
            facts=facts,
            observations=observations,
            insights=insights,
            memory_sources=memory_provenance,
            memory_status=memory_status,
            summary=summary_str,
        )

    def get_competitor_history(
        self,
        competitor_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category: Optional[EventCategory] = None,
        limit: int = 50,
    ) -> CompetitorHistoryResponse:
        """Fetch deterministic historical timeline for a competitor with memory provenance."""
        competitor = self.competitor_repository.get_by_id(competitor_id)
        if not competitor:
            raise NotFoundError("Competitor", competitor_id)

        if start_date and end_date and start_date > end_date:
            raise ValidationErrorException("Start date cannot be after end date.")

        cat_str = category.value if category else None
        db_events = self.event_repository.search_events(
            competitor_id=competitor_id,
            start_date=start_date,
            end_date=end_date,
            category=cat_str,
            limit=limit,
            sort_order="asc",
        )

        timeline_events, memory_provenance = self._merge_and_deduplicate(
            competitor=competitor,
            db_events=db_events,
            hindsight_memories=[],
        )

        date_range_info = None
        if start_date or end_date:
            date_range_info = DateRangeInfo(start=start_date, end=end_date)

        return CompetitorHistoryResponse(
            competitor=CompetitorSummaryInfo.model_validate(competitor),
            date_range=date_range_info,
            total_events=len(timeline_events),
            events=timeline_events,
            memory_sources=memory_provenance,
        )

    def _resolve_competitor(
        self,
        competitor_id: Optional[int],
        query: str,
    ) -> Optional[Competitor]:
        """Resolve competitor by explicit ID or natural language query text match."""
        if competitor_id is not None:
            return self.competitor_repository.get_by_id(competitor_id)

        all_competitors, _ = self.competitor_repository.get_all(limit=200)
        if not all_competitors:
            return None

        matched_name = extract_competitor_name(query, [c.name for c in all_competitors])
        if matched_name:
            for c in all_competitors:
                if c.name.lower() == matched_name.lower():
                    return c

        return None

    def _merge_and_deduplicate(
        self,
        competitor: Competitor,
        db_events: List[CompetitorEvent],
        hindsight_memories: List[Dict[str, Any]],
    ) -> Tuple[List[TimelineEventItem], List[MemoryProvenanceItem]]:
        """Merge database events and Hindsight memories, ensuring deterministic deduplication and provenance mapping."""
        timeline_events: List[TimelineEventItem] = []
        memory_sources: List[MemoryProvenanceItem] = []
        seen_event_ids = set()

        # Step 1: Add DB events
        for e in db_events:
            doc_id = f"event-{e.competitor_id}-{e.id}"
            src_name = e.source.name if e.source else None
            item = TimelineEventItem(
                event_id=e.id,
                competitor_id=e.competitor_id,
                competitor_name=competitor.name,
                date=e.event_date,
                category=e.category,
                title=e.title,
                summary=e.description,
                importance=e.importance,
                memory_document_id=doc_id,
                source_name=src_name,
                source_type="database",
            )
            timeline_events.append(item)
            seen_event_ids.add(e.id)

            # Record provenance entry
            memory_sources.append(
                MemoryProvenanceItem(
                    memory_document_id=doc_id,
                    event_id=e.id,
                    source_type="hindsight",
                    relevance="exact_match",
                    timestamp=e.event_date,
                    text_snippet=e.title,
                )
            )

        # Step 2: Inspect Hindsight memories for novel/unmapped entries
        for mem in hindsight_memories:
            text = mem.get("text", "")
            meta = mem.get("metadata") or {}
            event_id_meta = meta.get("event_id")
            doc_id_meta = meta.get("document_id") or meta.get("id") or f"hindsight-mem-{hash(text) % 10000}"

            try:
                ev_id = int(event_id_meta) if event_id_meta is not None else None
            except (ValueError, TypeError):
                ev_id = None

            if ev_id and ev_id in seen_event_ids:
                # Already captured via DB record
                continue

            # If unmapped Hindsight memory item
            memory_sources.append(
                MemoryProvenanceItem(
                    memory_document_id=str(doc_id_meta),
                    event_id=ev_id,
                    source_type="hindsight",
                    relevance="recalled_context",
                    timestamp=None,
                    text_snippet=text[:150],
                )
            )

        # Step 3: Sort timeline events chronologically (oldest to newest)
        timeline_events.sort(key=lambda x: x.date)

        return timeline_events, memory_sources

    def _detect_patterns(self, events: List[TimelineEventItem]) -> List[DetectedPatternItem]:
        """Detect historical activity patterns (frequency acceleration, category concentration, inactivity gaps)."""
        patterns: List[DetectedPatternItem] = []
        if not events:
            return patterns

        # 1. Category Concentration / Dominance
        category_counts: Dict[str, List[int]] = {}
        for e in events:
            category_counts.setdefault(e.category, []).append(e.event_id or 0)

        total_count = len(events)
        for cat, ev_ids in category_counts.items():
            pct = int((len(ev_ids) / total_count) * 100)
            if len(ev_ids) >= 2 or pct >= 40:
                patterns.append(
                    DetectedPatternItem(
                        pattern_type="dominant_category",
                        description=f"Category '{cat}' dominated historical activity with {len(ev_ids)} event(s) ({pct}% of total activity).",
                        supporting_event_ids=[i for i in ev_ids if i > 0],
                    )
                )

        # 2. Activity Acceleration (2nd half of date range vs 1st half)
        if total_count >= 3:
            mid = total_count // 2
            first_half = events[:mid]
            second_half = events[mid:]
            if len(second_half) > len(first_half):
                patterns.append(
                    DetectedPatternItem(
                        pattern_type="activity_acceleration",
                        description=f"Activity accelerated in the latter half of the observed period ({len(second_half)} events vs {len(first_half)} earlier).",
                        supporting_event_ids=[e.event_id for e in second_half if e.event_id],
                    )
                )

        # 3. Inactivity Gap Detection (> 30 days gap between events)
        for i in range(len(events) - 1):
            date1 = events[i].date
            date2 = events[i + 1].date
            gap_days = (date2 - date1).days
            if gap_days > 30:
                d1_str = date1.strftime("%Y-%m-%d")
                d2_str = date2.strftime("%Y-%m-%d")
                patterns.append(
                    DetectedPatternItem(
                        pattern_type="inactivity_gap",
                        description=f"Observed an inactivity gap of {gap_days} days between {d1_str} and {d2_str}.",
                        supporting_event_ids=[e.event_id for e in [events[i], events[i + 1]] if e.event_id],
                    )
                )

        return patterns

    def _generate_evidence(
        self,
        competitor_name: str,
        events: List[TimelineEventItem],
        patterns: List[DetectedPatternItem],
        date_range_expr: Optional[str] = None,
    ) -> Tuple[List[str], List[str], List[str], str]:
        """Categorize response into strictly grounded Facts, Observations, Insights, and a concise summary."""
        facts: List[str] = []
        observations: List[str] = []
        insights: List[str] = []

        if not events:
            summary = f"No recorded historical activity found for {competitor_name} during the specified timeframe."
            return facts, observations, insights, summary

        # FACTS
        for e in events:
            date_str = e.date.strftime("%Y-%m-%d") if hasattr(e.date, "strftime") else str(e.date)[:10]
            facts.append(
                f"FACT [{date_str}]: {competitor_name} recorded '{e.category}' event: {e.title}."
            )

        # OBSERVATIONS
        time_frame_desc = f"in {date_range_expr}" if date_range_expr else "in the recorded history"
        observations.append(
            f"OBSERVATION: {len(events)} total historical event(s) recorded for {competitor_name} {time_frame_desc}."
        )
        for p in patterns:
            observations.append(f"OBSERVATION: {p.description}")

        # INSIGHTS
        cat_counts = {}
        for e in events:
            cat_counts[e.category] = cat_counts.get(e.category, 0) + 1
        top_cat = max(cat_counts, key=cat_counts.get) if cat_counts else "general"

        insights.append(
            f"INSIGHT: {competitor_name}'s strategic focus is heavily centered around {top_cat}-related initiatives."
        )

        if len(events) >= 3:
            insights.append(
                f"INSIGHT: The frequency of recorded events suggests sustained operational execution by {competitor_name}."
            )

        # SUMMARY
        summary = (
            f"During the requested period, {competitor_name} recorded {len(events)} major event(s), "
            f"with primary activity in '{top_cat}'. Historical pattern analysis indicates {len(patterns)} strategic signal(s)."
        )

        return facts, observations, insights, summary
