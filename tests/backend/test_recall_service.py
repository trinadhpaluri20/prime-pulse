from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.competitor import Competitor
from app.models.enums import EventCategory, EventImportance
from app.schemas.competitor import CompetitorCreate
from app.schemas.event import CompetitorEventCreate
from app.schemas.recall import RecallQueryRequest
from app.services.competitor_service import CompetitorService
from app.services.event_service import EventService
from app.services.recall_service import RecallService
from app.services.hindsight_service import HindsightMemoryService
from app.utils.errors import ValidationErrorException


@pytest.fixture
def sample_competitor_data(db_session: Session):
    """Fixture initializing Microsoft AI competitor and multiple dated events across categories."""
    comp_service = CompetitorService(db_session)
    competitor = comp_service.create_competitor(
        CompetitorCreate(
            name="Microsoft AI",
            description="Leading AI solutions",
            industry="Enterprise AI",
            website="https://microsoft.com/ai",
        )
    )

    event_service = EventService(db_session)

    now = datetime.now(timezone.utc)
    d1 = now - timedelta(days=60)
    d2 = now - timedelta(days=45)
    d3 = now - timedelta(days=15)
    d4 = now - timedelta(days=5)

    e1 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PARTNERSHIP,
            title="Strategic Alliance with OpenAI",
            description="Expanded multi-billion dollar partnership for supercomputing infrastructure.",
            event_date=d1,
            importance=EventImportance.CRITICAL,
        ),
    )

    e2 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PRODUCT,
            title="Copilot Studio Announcement",
            description="Launched low-code studio for customizing enterprise copilots.",
            event_date=d2,
            importance=EventImportance.HIGH,
        ),
    )

    e3 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PRODUCT,
            title="Copilot Enterprise v2.0 Release",
            description="Major upgrade adding autonomous workflow orchestration.",
            event_date=d3,
            importance=EventImportance.CRITICAL,
        ),
    )

    e4 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PRICING,
            title="Seat-Based Pricing Tier Adjustment",
            description="Adjusted enterprise pricing tier by $5 per user per month.",
            event_date=d4,
            importance=EventImportance.MEDIUM,
        ),
    )

    return competitor, [e1, e2, e3, e4]


def test_1_valid_recall_query(db_session: Session, sample_competitor_data):
    """1. Test valid recall query for a registered competitor."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="What has Microsoft AI done in the last 90 days?")
    res = service.process_recall_query(req)

    assert res.status == "success"
    assert res.competitor is not None
    assert res.competitor.name == "Microsoft AI"
    assert len(res.events) == 4
    assert res.summary != ""


def test_2_empty_query(client: TestClient):
    """2. Test validation error when query is empty."""
    response = client.post("/api/v1/recall", json={"query": ""})
    assert response.status_code == 422


def test_3_unknown_competitor(db_session: Session, sample_competitor_data):
    """3. Test query referencing an un-tracked competitor."""
    service = RecallService(db_session)
    req = RecallQueryRequest(query="What did UnknownCorp do recently?")
    res = service.process_recall_query(req)

    assert res.status == "missing_competitor"
    assert "Could not identify a specific competitor" in res.summary
    assert len(res.events) == 0


def test_4_competitor_with_no_events(db_session: Session):
    """4. Test recall query for a competitor with zero recorded events."""
    comp_service = CompetitorService(db_session)
    comp = comp_service.create_competitor(
        CompetitorCreate(name="StartupAI", description=None, industry=None, website=None)
    )

    service = RecallService(db_session)
    req = RecallQueryRequest(query="What has StartupAI done in the last 30 days?")
    res = service.process_recall_query(req)

    assert res.status == "success"
    assert res.competitor.name == "StartupAI"
    assert len(res.events) == 0
    assert "No recorded historical activity found" in res.summary


def test_5_valid_date_range(db_session: Session, sample_competitor_data):
    """5. Test recall query with natural language date range ('last 30 days')."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="What did Microsoft AI do in the last 30 days?")
    res = service.process_recall_query(req)

    assert res.status == "success"
    assert res.date_range is not None
    # Out of 4 events, 2 occurred within last 30 days (d3 and d4)
    assert len(res.events) == 2


def test_6_invalid_date_range(db_session: Session, sample_competitor_data):
    """6. Test exception when start_date is after end_date."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    now = datetime.now(timezone.utc)
    req = RecallQueryRequest(
        query="What happened?",
        competitor_id=competitor.id,
        start_date=now,
        end_date=now - timedelta(days=10),
    )

    with pytest.raises(ValidationErrorException):
        service.process_recall_query(req)


def test_7_category_filtering(db_session: Session, sample_competitor_data):
    """7. Test filtering events by category (e.g., product releases)."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="Show Microsoft AI product launches")
    res = service.process_recall_query(req)

    assert res.status == "success"
    assert res.category_filter == EventCategory.PRODUCT
    assert all(e.category == EventCategory.PRODUCT.value for e in res.events)
    assert len(res.events) == 2


def test_8_historical_ordering(db_session: Session, sample_competitor_data):
    """8. Test that retrieved timeline events are ordered chronologically (oldest to newest)."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="Show historical timeline for Microsoft AI")
    res = service.process_recall_query(req)

    assert res.status == "success"
    assert len(res.events) >= 2
    # Verify chronological order (ascending date)
    for i in range(len(res.events) - 1):
        assert res.events[i].date <= res.events[i + 1].date


def test_9_deduplication(db_session: Session, sample_competitor_data):
    """9. Test deduplication when Hindsight returns memories corresponding to existing DB events."""
    competitor, events = sample_competitor_data

    mock_hindsight = MagicMock(spec=HindsightMemoryService)
    mock_hindsight.is_configured = True
    mock_hindsight.recall.return_value = {
        "results": [
            {
                "text": "Copilot Enterprise v2.0 Release",
                "score": 0.95,
                "metadata": {"event_id": str(events[2].id), "document_id": f"event-{competitor.id}-{events[2].id}"},
            }
        ]
    }

    service = RecallService(db_session, hindsight_service=mock_hindsight)
    req = RecallQueryRequest(query="What did Microsoft AI do?")
    res = service.process_recall_query(req)

    # Should not duplicate event in timeline
    event_ids = [e.event_id for e in res.events]
    assert len(event_ids) == len(set(event_ids))


def test_10_hindsight_retrieval(db_session: Session, sample_competitor_data):
    """10. Test Hindsight persistent memory recall integration."""
    competitor, events = sample_competitor_data

    mock_hindsight = MagicMock(spec=HindsightMemoryService)
    mock_hindsight.is_configured = True
    mock_hindsight.recall.return_value = {
        "results": [
            {
                "text": "External memory observation: Microsoft AI expanded data center capacity in Europe.",
                "score": 0.88,
                "metadata": {"document_id": "ext-doc-100"},
            }
        ]
    }

    service = RecallService(db_session, hindsight_service=mock_hindsight)
    req = RecallQueryRequest(query="What did Microsoft AI do?")
    res = service.process_recall_query(req)

    assert res.memory_status == "connected"
    # Unmapped external memory should produce a memory source provenance item
    ext_sources = [m for m in res.memory_sources if m.memory_document_id == "ext-doc-100"]
    assert len(ext_sources) == 1


def test_11_hindsight_unavailable(db_session: Session, sample_competitor_data):
    """11. Test system resilience when Hindsight memory service fails or throws an exception."""
    competitor, events = sample_competitor_data

    mock_hindsight = MagicMock(spec=HindsightMemoryService)
    mock_hindsight.is_configured = True
    mock_hindsight.recall.side_effect = Exception("Hindsight cluster connection timeout")

    service = RecallService(db_session, hindsight_service=mock_hindsight)
    req = RecallQueryRequest(query="What did Microsoft AI do in the last 90 days?")
    res = service.process_recall_query(req)

    # System must NOT crash and fall back seamlessly to DB events
    assert res.status == "success"
    assert res.memory_status == "unavailable"
    assert len(res.events) == 4


def test_12_evidence_and_provenance(db_session: Session, sample_competitor_data):
    """12. Test that facts, observations, insights, and memory provenance are correctly populated."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="What has Microsoft AI done?")
    res = service.process_recall_query(req)

    assert len(res.facts) == len(events)
    assert len(res.observations) >= 1
    assert len(res.insights) >= 1
    assert len(res.memory_sources) >= len(events)
    assert all(m.memory_document_id is not None for m in res.memory_sources)


def test_13_pattern_detection(db_session: Session, sample_competitor_data):
    """13. Test historical pattern detection algorithms (dominant category & activity acceleration)."""
    competitor, events = sample_competitor_data
    service = RecallService(db_session)

    req = RecallQueryRequest(query="Show Microsoft AI trajectory")
    res = service.process_recall_query(req)

    assert len(res.patterns) >= 1
    pattern_types = [p.pattern_type for p in res.patterns]
    assert "dominant_category" in pattern_types


def test_14_api_response_schema(client: TestClient, sample_competitor_data):
    """14. Test FastAPI endpoint contract validation for POST /recall and GET /competitors/{id}/history."""
    competitor, events = sample_competitor_data

    # POST /api/v1/recall
    res_post = client.post("/api/v1/recall", json={"query": "What did Microsoft AI do in the last 30 days?"})
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["status"] == "success"
    assert data_post["competitor"]["name"] == "Microsoft AI"
    assert "events" in data_post
    assert "patterns" in data_post
    assert "facts" in data_post
    assert "observations" in data_post
    assert "insights" in data_post
    assert "memory_sources" in data_post

    # GET /api/v1/competitors/{id}/history
    res_get = client.get(f"/api/v1/competitors/{competitor.id}/history")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["competitor"]["id"] == competitor.id
    assert data_get["total_events"] == 4
    assert len(data_get["events"]) == 4
