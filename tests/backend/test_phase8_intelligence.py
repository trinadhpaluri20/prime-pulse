import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.competitor import Competitor
from app.models.activity import Activity
from app.models.insight import Insight
from app.services.memory_service import MemoryService
from app.services.ai_service import AIService
from app.services.chat_service import ChatService
from app.services.insight_service import InsightService


@pytest.fixture
def populated_db(db_session: Session):
    """Seed test database with mock competitor and activities."""
    comp = Competitor(name="Competitor A", website="https://competitor-a.com")
    db_session.add(comp)
    db_session.commit()
    db_session.refresh(comp)

    act1 = Activity(
        competitor_id=comp.id,
        activity_type="pricing",
        title="Enterprise pricing discount detected",
        description="Reduced annual commitment minimum by 18%.",
        importance="high",
        detected_at=datetime.now(timezone.utc),
    )
    act2 = Activity(
        competitor_id=comp.id,
        activity_type="product",
        title="Autonomous agent builder beta launched",
        description="Public rollout of copilot workflow automation features.",
        importance="high",
        detected_at=datetime.now(timezone.utc),
    )
    db_session.add_all([act1, act2])

    ins = Insight(
        competitor_id=comp.id,
        type="pattern",
        title="Precursor Signal: Pricing discount precedes product launch",
        description="Repeated pattern where pricing reductions precede feature announcements.",
        confidence=0.87,
        evidence_count=2,
        priority="high",
        timeframe_days=30,
        evidence_data='{"evidenceDetails": {"observedFacts": ["Pricing dropped 18%"], "aiInterpretation": "Precursor pattern"}}',
    )
    db_session.add(ins)
    db_session.commit()
    return {"competitor": comp, "activities": [act1, act2], "insight": ins}


# 1. Memory retrieval test
@pytest.mark.asyncio
async def test_1_memory_retrieval(db_session: Session, populated_db):
    memory_service = MemoryService(db=db_session)
    res = await memory_service.retrieve_context(
        query="pricing discount",
        competitor="Competitor A",
        limit=5,
    )
    assert res["has_evidence"] is True
    assert res["events_count"] >= 1
    assert "Competitor A" in res["formatted_context"]
    assert "pricing" in res["formatted_context"].lower()


# 2. AI service test
@pytest.mark.asyncio
async def test_2_ai_service_response():
    ai = AIService(api_key="mock_key")
    with patch.object(ai, "get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_completion = MagicMock()
        mock_completion.choices = [
            MagicMock(message=MagicMock(content='{"title": "Test Pattern", "confidence": 0.9, "observations": ["Fact A"]}'))
        ]
        mock_client.chat.completions.create.return_value = mock_completion
        mock_get_client.return_value = mock_client

        result = await ai.analyze_competitor_pattern(
            competitor="Competitor A",
            historical_context="Pricing changed on Sep 28",
        )
        assert result.get("title") == "Test Pattern"
        assert result.get("confidence") == 0.9


# 3. Chat service test
@pytest.mark.asyncio
async def test_3_chat_service(db_session: Session, populated_db):
    chat = ChatService(db=db_session)
    with patch.object(chat.ai_service, "answer_chat_query") as mock_answer:
        mock_answer.return_value = {
            "answer": "**Summary**\n\nCompetitor A adjusted pricing recently.\n\n**Evidence Confidence**: 87%",
            "facts": ["Pricing reduced 18%"],
            "observations": ["Pattern indicates launch window"],
            "confidence": 0.87,
            "evidence": [{"label": "Pricing Change", "type": "Pricing"}],
            "related_events": ["Product Launch"],
        }

        resp = await chat.process_chat(query="What changed for Competitor A recently?")
        assert "Competitor A" in resp["answer"]
        assert resp["confidence"] == 0.87
        assert len(resp["evidence"]) > 0


# 4. Insight service test
def test_4_insight_service(db_session: Session, populated_db):
    service = InsightService(db=db_session)
    insights = service.get_insights(competitor="Competitor A")
    assert len(insights) >= 1
    assert "Precursor" in insights[0].title

    evidence = service.get_insight_evidence(insights[0].id)
    assert evidence.insight_id == insights[0].id
    assert evidence.evidence_details is not None


# 5. Missing API key test
@pytest.mark.asyncio
async def test_5_missing_api_key():
    ai = AIService(api_key="")
    assert ai.is_configured is False
    resp = await ai.generate_response(system_prompt="Test", user_prompt="Test")
    assert resp["is_available"] is False
    assert "temporarily unavailable" in resp["error"]


# 6. AI service failure graceful handling
@pytest.mark.asyncio
async def test_6_ai_service_failure():
    ai = AIService(api_key="test_key")
    with patch.object(ai, "get_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("Groq connection timeout")
        mock_get_client.return_value = mock_client

        resp = await ai.generate_response(system_prompt="Test", user_prompt="Test")
        assert resp["is_available"] is False
        assert "temporarily unavailable" in resp["error"]


# 7. No historical evidence test
@pytest.mark.asyncio
async def test_7_no_historical_evidence(db_session: Session):
    chat = ChatService(db=db_session)
    # Query for a non-existent competitor or completely irrelevant topic
    comp = Competitor(name="Unknown Corp")
    db_session.add(comp)
    db_session.commit()

    resp = await chat.process_chat(query="What did Unknown Corp do in 2021?", competitor_id=comp.id)
    assert "couldn't find enough historical evidence" in resp["answer"].lower()
    assert resp["confidence"] == 0.0
    assert len(resp["evidence"]) == 0


# 8. Valid AI response schema parsing
def test_8_valid_ai_response_parsing():
    ai = AIService(api_key="mock_key")
    valid_json = '```json\n{"summary": "Strategic shift detected", "confidence": 0.88, "observations": ["Obs 1"]}\n```'
    parsed = ai._parse_json_safely(valid_json)
    assert parsed["summary"] == "Strategic shift detected"
    assert parsed["confidence"] == 0.88
    assert len(parsed["observations"]) == 1


# 9. Invalid AI response graceful parsing
def test_9_invalid_ai_response_parsing():
    ai = AIService(api_key="mock_key")
    invalid_raw = "This is not valid JSON string from LLM"
    parsed = ai._parse_json_safely(invalid_raw)
    assert parsed.get("is_available") is True
    assert parsed.get("content") == invalid_raw


# 10. Follow-up conversation context test
@pytest.mark.asyncio
async def test_10_follow_up_conversation(db_session: Session, populated_db):
    chat = ChatService(db=db_session)
    with patch.object(chat.ai_service, "answer_chat_query") as mock_answer:
        mock_answer.return_value = {
            "answer": "Eight days later, Competitor A launched an agent builder.",
            "confidence": 0.88,
            "evidence": [{"label": "Agent builder", "type": "Product"}],
        }

        turn1 = await chat.process_chat(query="What happened after Competitor A changed pricing?")
        cid = turn1["conversation_id"]

        mock_answer.return_value = {
            "answer": "Yes, historical records indicate a similar pricing pattern preceded their previous release.",
            "confidence": 0.86,
            "evidence": [{"label": "Historical precedent", "type": "Pricing"}],
        }

        turn2 = await chat.process_chat(query="Did that happen before?", conversation_id=cid)
        assert turn2["conversation_id"] == cid
        assert "Yes" in turn2["answer"]


# 11. Security: Verify credentials never exposed to client
def test_11_secrets_never_returned(client, populated_db):
    # Verify /api/chat does not leak any secret
    chat_resp = client.post("/api/chat", json={"message": "What is the status of Competitor A?"})
    raw_text = chat_resp.text
    assert "gsk_" not in raw_text
    assert "hsk_" not in raw_text
    assert "GROQ_API_KEY" not in raw_text
    assert "HINDSIGHT_API_KEY" not in raw_text

    # Verify /api/insights does not leak any secret
    insights_resp = client.get("/api/insights")
    raw_insights = insights_resp.text
    assert "gsk_" not in raw_insights
    assert "hsk_" not in raw_insights
    assert "GROQ_API_KEY" not in raw_insights
