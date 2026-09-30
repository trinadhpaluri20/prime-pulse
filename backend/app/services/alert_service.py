from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, and_, or_, desc, update

from app.models.alert import Alert
from app.models.competitor import Competitor
from app.schemas.alert import (
    AlertCreate,
    AlertResponse,
    AlertListResponse,
)
from app.utils.errors import NotFoundError


class AlertService:
    """Business logic service for managing Smart Alerts."""

    def __init__(self, db: Session):
        self.db = db

    def get_alerts(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        competitor: Optional[str] = None,
        alert_type: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
    ) -> List[AlertResponse]:
        """Retrieve alerts with multi-dimensional filtering."""
        stmt = (
            select(Alert)
            .options(joinedload(Alert.competitor))
            .order_by(desc(Alert.created_at))
        )

        conditions = []
        if status:
            if status.lower() == "unread":
                conditions.append(Alert.is_read.is_(False))
            elif status.lower() == "read":
                conditions.append(Alert.is_read.is_(True))

        if priority and priority.lower() != "all":
            conditions.append(Alert.priority.ilike(priority))

        if competitor and competitor.lower() not in ("all", "all competitors"):
            conditions.append(
                Alert.competitor.has(Competitor.name.ilike(f"%{competitor}%"))
            )

        if alert_type and alert_type.lower() != "all":
            # Map hyphenated types like activity-spike
            clean_type = alert_type.replace("-", "_")
            conditions.append(Alert.alert_type.ilike(clean_type))

        if search:
            search_clause = or_(
                Alert.title.ilike(f"%{search}%"),
                Alert.description.ilike(f"%{search}%"),
            )
            conditions.append(search_clause)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        alerts = self.db.scalars(stmt.limit(limit)).unique().all()

        results = []
        for a in alerts:
            comp_name = a.competitor.name if a.competitor else f"Competitor {a.competitor_id}"
            results.append(
                AlertResponse(
                    id=a.id,
                    competitor_id=a.competitor_id,
                    title=a.title,
                    description=a.description,
                    priority=a.priority,
                    alert_type=a.alert_type,
                    historical_evidence_count=a.historical_evidence_count,
                    is_read=a.is_read,
                    why_it_matters=a.why_it_matters,
                    observation_fact=a.observation_fact,
                    interpretation=a.interpretation,
                    possible_signal=a.possible_signal,
                    competitor_name=comp_name,
                    competitor=comp_name,
                    type=a.alert_type.replace("_", "-"),
                    read=a.is_read,
                    detectedDisplay=a.created_at.strftime("%b %d, %Y - %I:%M %p UTC"),
                    timestamp=a.created_at.isoformat(),
                    whyItMatters=a.why_it_matters or a.description,
                    historicalEvidenceCount=a.historical_evidence_count,
                    created_at=a.created_at,
                    updated_at=a.updated_at,
                )
            )
        return results

    def get_alert_by_id(self, alert_id: int) -> AlertResponse:
        """Fetch alert by ID."""
        stmt = (
            select(Alert)
            .options(joinedload(Alert.competitor))
            .where(Alert.id == alert_id)
        )
        a = self.db.scalar(stmt)
        if not a:
            raise NotFoundError("Alert", alert_id)

        comp_name = a.competitor.name if a.competitor else f"Competitor {a.competitor_id}"
        return AlertResponse(
            id=a.id,
            competitor_id=a.competitor_id,
            title=a.title,
            description=a.description,
            priority=a.priority,
            alert_type=a.alert_type,
            historical_evidence_count=a.historical_evidence_count,
            is_read=a.is_read,
            why_it_matters=a.why_it_matters,
            observation_fact=a.observation_fact,
            interpretation=a.interpretation,
            possible_signal=a.possible_signal,
            competitor_name=comp_name,
            competitor=comp_name,
            type=a.alert_type.replace("_", "-"),
            read=a.is_read,
            detectedDisplay=a.created_at.strftime("%b %d, %Y - %I:%M %p UTC"),
            timestamp=a.created_at.isoformat(),
            whyItMatters=a.why_it_matters or a.description,
            historicalEvidenceCount=a.historical_evidence_count,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )

    def mark_read(self, alert_id: int, is_read: bool = True) -> AlertResponse:
        """Mark single alert as read or unread."""
        alert = self.db.get(Alert, alert_id)
        if not alert:
            raise NotFoundError("Alert", alert_id)

        alert.is_read = is_read
        self.db.commit()
        self.db.refresh(alert)
        return self.get_alert_by_id(alert.id)

    def mark_all_read(self) -> int:
        """Mark all unread alerts as read."""
        stmt = update(Alert).where(Alert.is_read.is_(False)).values(is_read=True)
        res = self.db.execute(stmt)
        self.db.commit()
        return res.rowcount or 0
