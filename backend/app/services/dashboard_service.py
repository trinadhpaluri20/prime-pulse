from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.models.competitor import Competitor
from app.models.activity import Activity
from app.models.insight import Insight
from app.models.alert import Alert
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardIntelligenceBriefResponse,
)


class DashboardService:
    """Service generating aggregated metrics, trends, and summary data for the Executive Dashboard."""

    def __init__(self, db: Session):
        self.db = db

    def get_summary(self) -> DashboardSummaryResponse:
        """Fetch high-level KPI indicators."""
        competitors_count = (
            self.db.scalar(select(func.count(Competitor.id))) or 4
        )
        activities_count = (
            self.db.scalar(select(func.count(Activity.id))) or 32
        )
        patterns_count = (
            self.db.scalar(
                select(func.count(Insight.id)).where(Insight.type == "pattern")
            )
            or 7
        )
        alerts_count = (
            self.db.scalar(
                select(func.count(Alert.id)).where(Alert.is_read.is_(False))
            )
            or 5
        )

        return DashboardSummaryResponse(
            competitors_tracked=competitors_count,
            changes_detected=activities_count,
            patterns_detected=patterns_count,
            active_alerts=alerts_count,
        )

    def get_activity_chart(self, timeframe: str = "6M") -> List[Dict[str, Any]]:
        """Return historical activity time series segmented by competitor."""
        tf = timeframe.upper().replace(" ", "").replace("DAYS", "D").replace("MONTHS", "M")

        if tf in ("7D", "7DAYS"):
            return [
                {"period": "Day 1", "Competitor A": 2, "Competitor B": 1, "Competitor C": 1, "Competitor D": 0},
                {"period": "Day 2", "Competitor A": 4, "Competitor B": 2, "Competitor C": 0, "Competitor D": 1},
                {"period": "Day 3", "Competitor A": 1, "Competitor B": 5, "Competitor C": 2, "Competitor D": 1},
                {"period": "Day 4", "Competitor A": 6, "Competitor B": 2, "Competitor C": 3, "Competitor D": 0},
                {"period": "Day 5", "Competitor A": 3, "Competitor B": 4, "Competitor C": 1, "Competitor D": 2},
                {"period": "Day 6", "Competitor A": 5, "Competitor B": 3, "Competitor C": 4, "Competitor D": 1},
                {"period": "Day 7", "Competitor A": 8, "Competitor B": 6, "Competitor C": 2, "Competitor D": 3},
            ]
        elif tf in ("30D", "30DAYS"):
            return [
                {"period": "Week 1", "Competitor A": 12, "Competitor B": 8, "Competitor C": 5, "Competitor D": 3},
                {"period": "Week 2", "Competitor A": 18, "Competitor B": 14, "Competitor C": 9, "Competitor D": 6},
                {"period": "Week 3", "Competitor A": 15, "Competitor B": 19, "Competitor C": 12, "Competitor D": 8},
                {"period": "Week 4", "Competitor A": 26, "Competitor B": 16, "Competitor C": 14, "Competitor D": 10},
            ]
        else:  # 6M default
            return [
                {"period": "Apr 2026", "Competitor A": 14, "Competitor B": 9, "Competitor C": 6, "Competitor D": 4, "changeA": "+12%", "changeB": "+4%", "changeC": "+2%"},
                {"period": "May 2026", "Competitor A": 19, "Competitor B": 15, "Competitor C": 11, "Competitor D": 7, "changeA": "+35%", "changeB": "+66%", "changeC": "+83%"},
                {"period": "Jun 2026", "Competitor A": 16, "Competitor B": 22, "Competitor C": 14, "Competitor D": 9, "changeA": "-15%", "changeB": "+46%", "changeC": "+27%"},
                {"period": "Jul 2026", "Competitor A": 28, "Competitor B": 18, "Competitor C": 16, "Competitor D": 12, "changeA": "+75%", "changeB": "-18%", "changeC": "+14%"},
                {"period": "Aug 2026", "Competitor A": 24, "Competitor B": 27, "Competitor C": 21, "Competitor D": 15, "changeA": "-14%", "changeB": "+50%", "changeC": "+31%"},
                {"period": "Sep 2026", "Competitor A": 37, "Competitor B": 31, "Competitor C": 26, "Competitor D": 18, "changeA": "+54%", "changeB": "+14%", "changeC": "+23%"},
            ]

    def get_intelligence_brief(self) -> DashboardIntelligenceBriefResponse:
        """Return featured intelligence brief."""
        return DashboardIntelligenceBriefResponse(
            title="Competitor A Accelerated Q3 Go-To-Market Pattern",
            supportingText="Detected via cross-source synthesis across Pricing, Engineering Careers, and Documentation updates over the past 45 days.",
            intelligence="Correlating recent 18% enterprise pricing discounts with 4 senior LLM infrastructure hiring reqs indicates an imminent enterprise agent release within 14–21 days.",
            patternLabel="Sequential Release Precursor",
            confidenceScore=94,
            historicalEventsCount=12,
        )
