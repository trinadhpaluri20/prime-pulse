from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.enums import EventCategory, EventImportance
from app.schemas.competitor import CompetitorCreate
from app.schemas.event import CompetitorEventCreate
from app.schemas.agent import AgentAnalysisRequest
from app.services.competitor_service import CompetitorService
from app.services.event_service import EventService
from app.services.agent_service import AgentService
from app.services.gemini_service import GeminiService
from app.services.hindsight_service import HindsightMemoryService
from app.utils.errors import ValidationErrorException


@pytest.fixture
def agent_sample_data(db_session: Session):
    """Fixture initializing Microsoft AI competitor and multiple dated events across categories."""
    comp_service = CompetitorService(db_session)
    competitor = comp_service.create_competitor(
        CompetitorCreate(
            name="Microsoft AI",
            description="Enterprise AI Solutions",
            industry="Enterprise Software",
            website="https://microsoft.com/ai",
        )
    )

    event_service = EventService(db_session)

    now = datetime.now(timezone.utc)
    d1 = now - timedelta(days=60)
    d2 = now - timedelta(days=30)
    d3 = now - timedelta(days=10)

    e1 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PARTNERSHIP,
            title="Supercomputing Alliance Expansion",
            description="Expanded infrastructure alliance for AI supercomputing workloads.",
            event_date=d1,
            importance=EventImportance.CRITICAL,
        ),
    )

    e2 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PRODUCT,
            title="Copilot Enterprise v2.0 Release",
            description="Major upgrade adding autonomous agentic workflow orchestration.",
            event_date=d2,
            importance=EventImportance.CRITICAL,
        ),
    )

    e3 = event_service.create_event(
        competitor.id,
        CompetitorEventCreate(
            category=EventCategory.PRICING,
            title="Enterprise Subscription Model Shift",
            description="Adjusted seat-based pricing model by $5 per user per month.",
            event_date=d3,
            importance=EventImportance.MEDIUM,
        ),
    )

    return competitor, [e1, e2, e3]


def test_1_successful_gemini_call(db_session: Session, agent_sample_data):
    """1. Test successful Gemini API call with mocked completion response."""
    competitor, events = agent_sample_data

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Microsoft AI expanded AI infrastructure and launched Copilot Enterprise v2.0.",
        "facts": ["FACT [2026-08-30]: Released Copilot Enterprise v2.0."],
        "observations": ["OBSERVATION: Activity shifted from infrastructure to product and pricing."],
        "insights": ["INSIGHT: Microsoft AI is aggressively monetizing autonomous agent capabilities."],
        "limitations": [],
    }

    service = AgentService(db_session, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="What has Microsoft AI done in the last 90 days?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "success"
    assert res.gemini_status == "connected"
    assert res.competitor.name == "Microsoft AI"
    assert "Copilot Enterprise v2.0" in res.summary
    assert len(res.facts) >= 1
    assert len(res.evidence) == 3


def test_2_missing_gemini_api_key(db_session: Session, agent_sample_data):
    """2. Test graceful fallback when GEMINI_API_KEY is not configured."""
    competitor, events = agent_sample_data

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = False

    service = AgentService(db_session, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="What did Microsoft AI do in the last 90 days?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "degraded"
    assert res.gemini_status == "not_configured"
    assert len(res.evidence) == 3
    assert any("GEMINI_API_KEY is not configured" in lim for lim in res.limitations)


def test_3_gemini_api_failure(db_session: Session, agent_sample_data):
    """3. Test graceful fallback when Gemini API raises a timeout or status exception."""
    competitor, events = agent_sample_data

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.side_effect = Exception("Google GenAI API quota exceeded")

    service = AgentService(db_session, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="What did Microsoft AI do recently?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "degraded"
    assert res.gemini_status == "unavailable"
    assert len(res.evidence) == 3
    assert any("Gemini LLM service execution failed" in lim for lim in res.limitations)


def test_4_hindsight_retrieval_in_agent(db_session: Session, agent_sample_data):
    """4. Test Hindsight persistent memory retrieval integration in Agent context."""
    competitor, events = agent_sample_data

    mock_hindsight = MagicMock(spec=HindsightMemoryService)
    mock_hindsight.is_configured = True
    mock_hindsight.recall.return_value = {
        "results": [
            {
                "text": "Recalled Memory: Microsoft AI announced new data center region in Europe.",
                "score": 0.92,
                "metadata": {"document_id": "ext-doc-200"},
            }
        ]
    }

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Analyzed historical events and persistent memories.",
        "facts": ["FACT: European data center expansion noted."],
        "observations": [],
        "insights": [],
        "limitations": [],
    }

    from app.services.recall_service import RecallService
    recall_svc = RecallService(db_session, hindsight_service=mock_hindsight)

    service = AgentService(db_session, recall_service=recall_svc, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="What did Microsoft AI do?")
    res = service.analyze_competitor_intelligence(req)

    assert res.memory_status == "connected"
    assert any(m.memory_document_id == "ext-doc-200" for m in res.memory_sources)


def test_5_hindsight_unavailable_in_agent(db_session: Session, agent_sample_data):
    """5. Test agent behavior when Hindsight memory service is offline/unavailable."""
    competitor, events = agent_sample_data

    mock_hindsight = MagicMock(spec=HindsightMemoryService)
    mock_hindsight.is_configured = True
    mock_hindsight.recall.side_effect = Exception("Hindsight cluster offline")

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Analysis grounded in database events.",
        "facts": ["FACT: Copilot Enterprise v2.0 Release."],
        "observations": [],
        "insights": [],
        "limitations": [],
    }

    from app.services.recall_service import RecallService
    recall_svc = RecallService(db_session, hindsight_service=mock_hindsight)

    service = AgentService(db_session, recall_service=recall_svc, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="What did Microsoft AI do?")
    res = service.analyze_competitor_intelligence(req)

    assert res.memory_status == "unavailable"
    assert res.gemini_status == "connected"
    assert len(res.evidence) == 3


def test_6_database_retrieval(db_session: Session, agent_sample_data):
    """6. Test Tool 3 (get_competitor_events) searching database events directly."""
    competitor, events = agent_sample_data
    service = AgentService(db_session)

    results = service.tool_get_competitor_events(competitor_id=competitor.id)
    assert len(results) == 3


def test_7_evidence_deduplication(db_session: Session, agent_sample_data):
    """7. Test evidence context deduplication."""
    competitor, events = agent_sample_data
    service = AgentService(db_session)

    req = AgentAnalysisRequest(query="What did Microsoft AI do?")

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Deduplicated analysis",
        "facts": [],
        "observations": [],
        "insights": [],
        "limitations": [],
    }
    service.gemini_service = mock_gemini

    res = service.analyze_competitor_intelligence(req)
    ev_ids = [e.event_id for e in res.evidence]
    assert len(ev_ids) == len(set(ev_ids))


def test_8_agent_orchestration_pipeline(db_session: Session, agent_sample_data):
    """8. Test full end-to-end agent orchestration pipeline."""
    competitor, events = agent_sample_data
    service = AgentService(db_session)

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "End-to-end pipeline execution succeeded.",
        "facts": ["FACT: Partnership expanded."],
        "observations": ["OBSERVATION: Rapid execution."],
        "insights": ["INSIGHT: Enterprise focus."],
        "limitations": [],
    }
    service.gemini_service = mock_gemini

    req = AgentAnalysisRequest(query="What has Microsoft AI done in the last 90 days?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "success"
    assert res.competitor.name == "Microsoft AI"
    assert len(res.facts) >= 1
    assert len(res.observations) >= 1
    assert len(res.insights) >= 1


def test_9_empty_query_validation(client: TestClient):
    """9. Test validation error when query is empty."""
    res = client.post("/api/v1/analyze", json={"query": ""})
    assert res.status_code == 422


def test_10_unknown_competitor_query(db_session: Session, agent_sample_data):
    """10. Test agent response when query references an untracked competitor."""
    service = AgentService(db_session)
    req = AgentAnalysisRequest(query="What did UnknownCorp do?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "missing_competitor"
    assert "Could not identify a specific competitor" in res.summary


def test_11_competitor_with_no_records(db_session: Session):
    """11. Test agent response for a competitor with zero recorded events."""
    comp_service = CompetitorService(db_session)
    comp = comp_service.create_competitor(
        CompetitorCreate(name="EmptyCorp", description=None, industry=None, website=None)
    )

    service = AgentService(db_session)

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "No recorded evidence found.",
        "facts": [],
        "observations": [],
        "insights": [],
        "limitations": ["No events found."],
    }
    service.gemini_service = mock_gemini

    req = AgentAnalysisRequest(query="What has EmptyCorp done in the last 30 days?")
    res = service.analyze_competitor_intelligence(req)

    assert res.status == "success"
    assert len(res.evidence) == 0
    assert any("No historical competitor events found" in lim for lim in res.limitations)


def test_12_structured_gemini_parsing(db_session: Session, agent_sample_data):
    """12. Test parsing and validation of structured JSON response from Gemini."""
    competitor, events = agent_sample_data

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Structured summary",
        "facts": ["FACT [2026-08-30]: Copilot Enterprise release"],
        "observations": ["OBSERVATION: Active release cadence"],
        "insights": ["INSIGHT: Product innovation strategy"],
        "limitations": [],
    }

    service = AgentService(db_session, gemini_service=mock_gemini)
    req = AgentAnalysisRequest(query="Analyze Microsoft AI")
    res = service.analyze_competitor_intelligence(req)

    assert res.summary == "Structured summary"
    assert res.facts == ["FACT [2026-08-30]: Copilot Enterprise release"]


def test_13_provenance_and_citations(db_session: Session, agent_sample_data):
    """13. Test provenance tracking details returned with agent response."""
    competitor, events = agent_sample_data
    service = AgentService(db_session)

    mock_gemini = MagicMock(spec=GeminiService)
    mock_gemini.is_configured = True
    mock_gemini.generate_analysis.return_value = {
        "summary": "Summary",
        "facts": [],
        "observations": [],
        "insights": [],
        "limitations": [],
    }
    service.gemini_service = mock_gemini

    req = AgentAnalysisRequest(query="What did Microsoft AI do?")
    res = service.analyze_competitor_intelligence(req)

    assert len(res.memory_sources) >= len(events)
    assert all(m.memory_document_id is not None for m in res.memory_sources)


def test_14_api_endpoint_contract(client: TestClient, agent_sample_data):
    """14. Test FastAPI endpoint contract for POST /api/v1/analyze."""
    competitor, events = agent_sample_data

    with patch.object(GeminiService, "is_configured", True), \
         patch.object(GeminiService, "generate_analysis") as mock_gen:
        mock_gen.return_value = {
            "summary": "API endpoint integration verified successfully.",
            "facts": ["FACT: Copilot Enterprise v2.0 Release"],
            "observations": ["OBSERVATION: Active releases"],
            "insights": ["INSIGHT: Aggressive expansion"],
            "limitations": [],
        }

        res = client.post("/api/v1/analyze", json={"query": "What did Microsoft AI do in the last 90 days?"})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["competitor"]["name"] == "Microsoft AI"
        assert "summary" in data
        assert "facts" in data
        assert "observations" in data
        assert "insights" in data
        assert "evidence" in data
        assert "memory_sources" in data
