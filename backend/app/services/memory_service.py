import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, desc

from app.core.config import settings
from app.services.hindsight_service import HindsightMemoryService
from app.models.activity import Activity
from app.models.competitor import Competitor

logger = logging.getLogger("app.services.memory_service")


class MemoryService:
    """Dedicated memory abstraction layer separating historical storage and retrieval

    from specific persistence backends (Hindsight persistent memory + PostgreSQL/SQLite).
    The rest of the application interacts with this service rather than direct vendor APIs.
    """

    def __init__(
        self,
        db: Optional[Session] = None,
        hindsight_service: Optional[HindsightMemoryService] = None,
    ):
        self.db = db
        self.hindsight_service = hindsight_service or HindsightMemoryService()

    async def store_event(
        self,
        competitor: str,
        activity_type: str,
        title: str,
        description: str,
        date: Optional[Union[str, datetime]] = None,
        importance: str = "medium",
        source: Optional[str] = None,
        related_events: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Store competitor activity into persistent memory (Hindsight + Local DB).

        Saves structured context including relationships and temporal markers.
        """
        # Parse timestamp safely
        if isinstance(date, datetime):
            ts = date
        elif isinstance(date, str):
            try:
                ts = datetime.fromisoformat(date.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        date_str = ts.strftime("%b %d, %Y")
        related_str = f" | Preceding/Following: {' -> '.join(related_events)}" if related_events else ""

        # Format memory narrative
        memory_content = (
            f"Competitor: {competitor} | Activity: {activity_type.upper()} | Date: {date_str} | "
            f"Title: {title} | Description: {description} | Importance: {importance}"
            f"{related_str}"
        )

        hindsight_result = None
        if self.hindsight_service.is_configured:
            try:
                clean_tags = [
                    competitor.lower().replace(" ", "_"),
                    activity_type.lower().replace(" ", "_"),
                ]
                hindsight_result = self.hindsight_service.retain(
                    content=memory_content,
                    context=f"Competitive intelligence monitoring: {competitor}",
                    timestamp=ts,
                    tags=clean_tags,
                    metadata={
                        "competitor": competitor,
                        "activity_type": activity_type,
                        "importance": importance,
                    },
                )
                logger.info(f"[MEMORY] Successfully stored event in Hindsight for {competitor}")
            except Exception as err:
                logger.warning(
                    f"[MEMORY] Hindsight store failed, persisting locally: {type(err).__name__}"
                )

        # Store in local database if session provided
        db_id = None
        if self.db:
            try:
                comp = self.db.scalar(
                    select(Competitor).where(Competitor.name.ilike(competitor.strip()))
                )
                if comp:
                    new_act = Activity(
                        competitor_id=comp.id,
                        activity_type=activity_type.lower(),
                        title=title,
                        description=description,
                        importance=importance.lower(),
                        detected_at=ts,
                    )
                    self.db.add(new_act)
                    self.db.commit()
                    self.db.refresh(new_act)
                    db_id = new_act.id
            except Exception as db_err:
                logger.warning(f"[MEMORY] DB store error: {db_err}")
                self.db.rollback()

        return {
            "status": "stored",
            "competitor": competitor,
            "title": title,
            "date": date_str,
            "hindsight_stored": bool(hindsight_result),
            "db_id": db_id,
        }

    async def retrieve_context(
        self,
        query: str,
        competitor: Optional[str] = None,
        activity_type: Optional[str] = None,
        timeframe_days: Optional[int] = None,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Retrieve relevant historical context based on query terms, competitor,

        activity type, and timeframe. Prioritizes specific relevance rather than
        dumping the entire database.
        """
        retrieved_events: List[Dict[str, Any]] = []
        seen_keys = set()

        # 1. Query Hindsight Memory if configured
        if self.hindsight_service.is_configured:
            try:
                search_query = query
                if competitor:
                    search_query = f"{competitor} {search_query}"
                if activity_type:
                    search_query = f"{search_query} {activity_type}"

                hindsight_resp = self.hindsight_service.recall(
                    query=search_query,
                    limit=limit,
                )
                for res in hindsight_resp.get("results", []):
                    raw_text = res.get("text", "")
                    # When a competitor is specified, ensure recalled text actually references that competitor
                    if competitor and competitor.lower() not in raw_text.lower():
                        continue
                    if raw_text:
                        retrieved_events.append({
                            "source_system": "hindsight",
                            "score": res.get("score"),
                            "content": raw_text,
                            "competitor": competitor or "Monitored Landscape",
                            "type": activity_type or "Pattern",
                            "date": "Historical record",
                            "title": raw_text[:80] + "..." if len(raw_text) > 80 else raw_text,
                            "description": raw_text,
                        })
                logger.info(f"[MEMORY] Recalled {len(retrieved_events)} items from Hindsight")
            except Exception as err:
                logger.warning(
                    f"[MEMORY] Hindsight recall error ({type(err).__name__}), querying relational memory."
                )

        # 2. Query Local Database Activities (structured grounded memory)
        if self.db:
            try:
                stmt = select(Activity).order_by(desc(Activity.detected_at))
                conditions = []

                if competitor and competitor.lower() not in ("all", "all competitors"):
                    comp_subquery = select(Competitor.id).where(
                        Competitor.name.ilike(f"%{competitor.strip()}%")
                    )
                    conditions.append(Activity.competitor_id.in_(comp_subquery))

                if activity_type and activity_type.lower() not in ("all", "all types"):
                    conditions.append(Activity.activity_type.ilike(activity_type.strip()))

                if timeframe_days:
                    cutoff = datetime.now(timezone.utc) - timedelta(days=timeframe_days)
                    conditions.append(Activity.detected_at >= cutoff)

                # Search query matching in title or description
                if query and query.strip():
                    terms = query.strip().split()
                    text_conditions = []
                    for t in terms:
                        if len(t) > 2 and t.lower() not in ("what", "when", "where", "how", "the", "and", "for"):
                            text_conditions.append(Activity.title.ilike(f"%{t}%"))
                            text_conditions.append(Activity.description.ilike(f"%{t}%"))
                    if text_conditions:
                        conditions.append(or_(*text_conditions))

                if conditions:
                    stmt = stmt.where(and_(*conditions))

                db_acts = self.db.scalars(stmt.limit(limit * 2)).all()

                # If specific keywords had 0 hits but competitor is known, fallback to competitor's recent timeline
                if not db_acts and competitor and competitor.lower() not in ("all", "all competitors"):
                    comp_subquery = select(Competitor.id).where(
                        Competitor.name.ilike(f"%{competitor.strip()}%")
                    )
                    fallback_stmt = (
                        select(Activity)
                        .where(Activity.competitor_id.in_(comp_subquery))
                        .order_by(desc(Activity.detected_at))
                        .limit(limit * 2)
                    )
                    db_acts = self.db.scalars(fallback_stmt).all()

                for act in db_acts:
                    comp_name = act.competitor.name if act.competitor else "Competitor"
                    date_display = act.detected_at.strftime("%b %d, %Y")
                    dedup_key = f"{comp_name}-{act.title}".lower()

                    if dedup_key not in seen_keys:
                        seen_keys.add(dedup_key)
                        retrieved_events.append({
                            "id": f"act-{act.id}",
                            "source_system": "relational_timeline",
                            "competitor": comp_name,
                            "type": act.activity_type.capitalize(),
                            "title": act.title,
                            "description": act.description,
                            "importance": act.importance,
                            "date": date_display,
                            "timestamp": act.detected_at.isoformat(),
                            "content": f"[{date_display}] {comp_name} ({act.activity_type.upper()}, {act.importance.upper()}): {act.title} - {act.description}",
                        })
            except Exception as db_err:
                logger.error(f"[MEMORY] Relational memory query error: {db_err}")

        # Limit to requested ceiling
        final_events = retrieved_events[:limit]
        formatted_context = self.format_memory_results_for_ai(final_events)

        return {
            "query": query,
            "competitor": competitor,
            "activity_type": activity_type,
            "events_count": len(final_events),
            "has_evidence": len(final_events) > 0,
            "events": final_events,
            "formatted_context": formatted_context,
        }

    async def find_related_events(
        self,
        competitor: Optional[str] = None,
        activity_type: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Find related historical events (preceding or follow-on activities)

        to establish sequential patterns and evidence linkages.
        """
        results = await self.retrieve_context(
            query=query or "",
            competitor=competitor,
            activity_type=activity_type,
            limit=limit,
        )
        related = []
        for idx, ev in enumerate(results.get("events", [])):
            related.append({
                "id": ev.get("id", f"ev-{idx}"),
                "label": ev.get("title", "Related Event"),
                "date": ev.get("date", "Historical"),
                "type": ev.get("type", "Activity"),
                "description": ev.get("description", ""),
                "competitor": ev.get("competitor", competitor or "Competitor"),
            })
        return related

    def format_memory_results_for_ai(self, memories: List[Dict[str, Any]]) -> str:
        """Format retrieved historical records into clean structured context for LLM grounding."""
        if not memories:
            return "NO RELEVANT HISTORICAL EVIDENCE FOUND IN MONITORED DATA."

        lines = [
            "=== RETRIEVED HISTORICAL COMPETITOR EVIDENCE ===",
            f"Total Evidence Records: {len(memories)}",
            "",
        ]

        for idx, m in enumerate(memories, 1):
            date = m.get("date", "Historical")
            comp = m.get("competitor", "Competitor")
            act_type = m.get("type", "Event")
            title = m.get("title", "")
            desc = m.get("description") or m.get("content", "")
            importance = m.get("importance", "medium")

            lines.append(f"[{idx}] Date: {date} | Competitor: {comp} | Category: {act_type} | Importance: {importance}")
            lines.append(f"    Title: {title}")
            lines.append(f"    Observed Details: {desc}")
            lines.append("")

        lines.append("=== END HISTORICAL EVIDENCE ===")
        return "\n".join(lines)
