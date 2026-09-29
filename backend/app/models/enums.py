from enum import Enum


class EventCategory(str, Enum):
    """Controlled event categories for competitive intelligence."""

    PRICING = "pricing"
    PRODUCT = "product"
    FEATURE = "feature"
    MESSAGING = "messaging"
    HIRING = "hiring"
    MARKET = "market"
    PARTNERSHIP = "partnership"
    FUNDING = "funding"
    ACQUISITION = "acquisition"
    LEADERSHIP = "leadership"
    SECURITY = "security"
    REGULATORY = "regulatory"
    OTHER = "other"


class EventImportance(str, Enum):
    """Controlled event importance levels."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SourceType(str, Enum):
    """Controlled event source types."""

    COMPANY_WEBSITE = "company_website"
    PRESS_RELEASE = "press_release"
    PRODUCT_PAGE = "product_page"
    PRICING_PAGE = "pricing_page"
    PUBLIC_ANNOUNCEMENT = "public_announcement"
    RESEARCH_NOTE = "research_note"
    USER_ENTERED = "user_entered"
    OTHER = "other"
