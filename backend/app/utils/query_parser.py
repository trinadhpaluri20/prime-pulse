import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, List
from app.models.enums import EventCategory


def parse_date_range(
    query: str,
    reference_date: Optional[datetime] = None,
) -> Tuple[Optional[datetime], Optional[datetime], Optional[str]]:
    """Parse natural language date expressions into deterministic (start_date, end_date, expression_text).

    Supports:
    - today
    - yesterday
    - last/past N days (e.g. 7 days, 30 days, 90 days)
    - this month
    - previous/last month
    - this year
    """
    if not query:
        return None, None, None

    ref = reference_date or datetime.now(timezone.utc)
    q_lower = query.lower()

    # Match "last/past N days" or "N days"
    days_match = re.search(r"\b(?:last|past)?\s*(\d+)\s*days?\b", q_lower)
    if days_match:
        num_days = int(days_match.group(1))
        start_date = ref - timedelta(days=num_days)
        return start_date, ref, f"last {num_days} days"

    if "today" in q_lower:
        start_date = ref.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = ref.replace(hour=23, minute=59, second=59, microsecond=999999)
        return start_date, end_date, "today"

    if "yesterday" in q_lower:
        yesterday_ref = ref - timedelta(days=1)
        start_date = yesterday_ref.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = yesterday_ref.replace(hour=23, minute=59, second=59, microsecond=999999)
        return start_date, end_date, "yesterday"

    if "this month" in q_lower:
        start_date = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return start_date, ref, "this month"

    if "previous month" in q_lower or "last month" in q_lower:
        first_of_this_month = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_prev_month = first_of_this_month - timedelta(microseconds=1)
        first_day_prev_month = last_day_prev_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return first_day_prev_month, last_day_prev_month, "previous month"

    if "this year" in q_lower:
        start_date = ref.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        return start_date, ref, "this year"

    return None, None, None


def extract_competitor_name(
    query: str,
    known_competitor_names: List[str],
) -> Optional[str]:
    """Extract known competitor name from query by matching against known competitor list.

    Sorts candidates by length descending to ensure longer matches ("Microsoft AI") take precedence over shorter substrings ("Microsoft").
    """
    if not query or not known_competitor_names:
        return None

    q_lower = query.lower()
    # Sort names by length descending
    sorted_names = sorted(known_competitor_names, key=len, reverse=True)

    for name in sorted_names:
        if name.lower() in q_lower:
            return name

    return None


def extract_event_category(query: str) -> Optional[EventCategory]:
    """Extract matching EventCategory enum from natural language query based on category terms."""
    if not query:
        return None

    q_lower = query.lower()

    synonyms = {
        EventCategory.PRODUCT: ["product", "launch", "releases", "released", "version", "update", "feature"],
        EventCategory.PRICING: ["pricing", "price", "cost", "tier", "subscription", "discount"],
        EventCategory.PARTNERSHIP: ["partnership", "partner", "collaboration", "ally", "joint venture"],
        EventCategory.FUNDING: ["funding", "raised", "capital", "series a", "series b", "investment", "valuation"],
        EventCategory.LEADERSHIP: ["leadership", "executive", "ceo", "cto", "cfo", "hiring", "hire", "appointed"],
        EventCategory.ACQUISITION: ["acquisition", "acquired", "merger", "bought"],
        EventCategory.SECURITY: ["security", "breach", "vulnerability", "patch"],
        EventCategory.REGULATORY: ["regulatory", "compliance", "lawsuit", "legal", "gdpr"],
        EventCategory.MARKET: ["market", "expansion", "territory", "geography"],
        EventCategory.HIRING: ["hiring", "recruit", "jobs"],
        EventCategory.MESSAGING: ["messaging", "positioning", "branding", "marketing"],
    }

    for category, terms in synonyms.items():
        for term in terms:
            if re.search(r"\b" + re.escape(term) + r"\b", q_lower):
                return category

    return None
