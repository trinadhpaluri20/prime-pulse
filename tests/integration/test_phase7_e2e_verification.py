import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Ensure project root and backend directory are in python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
backend_dir = os.path.join(project_root, "backend")
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from tests.backend.conftest import client, db_session, setup_test_db  # noqa: F401


def test_phase7_complete_e2e_flow(client):
    """Phase 7 Step 2 & Step 6 Verification:
    Executes the complete E2E workflow across all 14 API endpoints:
    Health -> Competitor CRUD -> Event Ingestion -> Historical Recall -> Gemini AI Agent -> Cleanup.
    """
    # -------------------------------------------------------------------------
    # 1. HEALTH CHECK (GET /api/v1/health)
    # -------------------------------------------------------------------------
    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] in ["healthy", "degraded"]
    assert health_data["database"] == "connected"
    assert "gemini" in health_data

    # -------------------------------------------------------------------------
    # 2. COMPETITOR CRUD
    # -------------------------------------------------------------------------
    # POST /api/v1/competitors
    comp_payload = {
        "name": "Microsoft AI",
        "description": "Enterprise Artificial Intelligence Division",
        "industry": "Enterprise Software",
        "website": "https://microsoft.com/ai",
    }
    comp_create_res = client.post("/api/v1/competitors", json=comp_payload)
    assert comp_create_res.status_code == 201
    comp_data = comp_create_res.json()
    comp_id = comp_data["id"]
    assert comp_data["name"] == "Microsoft AI"

    # GET /api/v1/competitors
    comp_list_res = client.get("/api/v1/competitors")
    assert comp_list_res.status_code == 200
    assert comp_list_res.json()["total"] >= 1

    # GET /api/v1/competitors/{id}
    comp_get_res = client.get(f"/api/v1/competitors/{comp_id}")
    assert comp_get_res.status_code == 200
    assert comp_get_res.json()["name"] == "Microsoft AI"

    # PUT /api/v1/competitors/{id}
    comp_update_res = client.put(
        f"/api/v1/competitors/{comp_id}",
        json={"description": "Global Enterprise AI & Cloud Computing Leader"},
    )
    assert comp_update_res.status_code == 200
    assert comp_update_res.json()["description"] == "Global Enterprise AI & Cloud Computing Leader"

    # -------------------------------------------------------------------------
    # 3. COMPETITOR EVENTS
    # -------------------------------------------------------------------------
    with patch("app.services.hindsight_service.HindsightMemoryService.retain") as mock_retain:
        mock_retain.return_value = {"status": "retained", "document_id": f"event-{comp_id}-1"}

        # Event 1: Partnership
        ev1_res = client.post(
            f"/api/v1/competitors/{comp_id}/events",
            json={
                "category": "partnership",
                "title": "Supercomputing Alliance Expansion",
                "description": "Expanded infrastructure alliance for AI supercomputing workloads.",
                "event_date": "2026-07-31T00:00:00Z",
                "importance": "critical",
            },
        )
        assert ev1_res.status_code == 201
        ev1_data = ev1_res.json()
        ev1_id = ev1_data["id"]

        # Event 2: Product Launch
        ev2_res = client.post(
            f"/api/v1/competitors/{comp_id}/events",
            json={
                "category": "product",
                "title": "Copilot Enterprise v2.0 Release",
                "description": "Major upgrade adding autonomous agentic workflow orchestration.",
                "event_date": "2026-08-30T00:00:00Z",
                "importance": "critical",
            },
        )
        assert ev2_res.status_code == 201
        ev2_data = ev2_res.json()
        ev2_id = ev2_data["id"]

        # Event 3: Pricing Shift
        ev3_res = client.post(
            f"/api/v1/competitors/{comp_id}/events",
            json={
                "category": "pricing",
                "title": "Enterprise Subscription Model Shift",
                "description": "Adjusted seat-based pricing model by $5 per user per month.",
                "event_date": "2026-09-19T00:00:00Z",
                "importance": "medium",
            },
        )
        assert ev3_res.status_code == 201
        ev3_id = ev3_res.json()["id"]

    # GET /api/v1/competitors/{id}/events
    events_list_res = client.get(f"/api/v1/competitors/{comp_id}/events")
    assert events_list_res.status_code == 200
    assert events_list_res.json()["total"] == 3

    # GET /api/v1/events/{event_id}
    ev_get_res = client.get(f"/api/v1/events/{ev1_id}")
    assert ev_get_res.status_code == 200
    assert ev_get_res.json()["title"] == "Supercomputing Alliance Expansion"

    # PUT /api/v1/events/{event_id}
    ev_put_res = client.put(
        f"/api/v1/events/{ev1_id}",
        json={"title": "Global AI Infrastructure & Supercomputing Alliance Expansion"},
    )
    assert ev_put_res.status_code == 200
    assert ev_put_res.json()["title"] == "Global AI Infrastructure & Supercomputing Alliance Expansion"

    # -------------------------------------------------------------------------
    # 4. RECALL & HISTORICAL INTELLIGENCE ENGINE
    # -------------------------------------------------------------------------
    with patch("app.services.hindsight_service.HindsightMemoryService.recall") as mock_recall:
        mock_recall.return_value = {
            "status": "success",
            "results": [
                {
                    "content": "Microsoft AI launched Copilot Enterprise v2.0.",
                    "document_id": f"event-{comp_id}-{ev2_id}",
                    "score": 0.95,
                    "metadata": {"event_id": str(ev2_id)},
                }
            ],
        }

        # POST /api/v1/recall
        recall_res = client.post(
            "/api/v1/recall",
            json={
                "query": "What has Microsoft AI done in the last 90 days?",
                "competitor_id": comp_id,
            },
        )
        assert recall_res.status_code == 200
        recall_data = recall_res.json()
        assert recall_data["status"] == "success"
        assert recall_data["competitor"]["name"] == "Microsoft AI"
        assert len(recall_data["events"]) >= 3
        assert len(recall_data["facts"]) >= 1

        # GET /api/v1/competitors/{id}/history
        history_res = client.get(f"/api/v1/competitors/{comp_id}/history")
        assert history_res.status_code == 200
        history_data = history_res.json()
        assert history_data["competitor"]["id"] == comp_id
        assert len(history_data["events"]) == 3

    # -------------------------------------------------------------------------
    # 5. AI AGENT ORCHESTRATION (POST /api/v1/analyze with Gemini)
    # -------------------------------------------------------------------------
    mock_gemini_analysis = {
        "summary": "In the last 90 days, Microsoft AI recorded 3 strategic moves across infrastructure partnerships, Copilot Enterprise v2.0 product launch, and subscription pricing updates.",
        "facts": [
            "FACT [2026-07-31]: Global AI Infrastructure & Supercomputing Alliance Expansion.",
            "FACT [2026-08-30]: Copilot Enterprise v2.0 Release.",
            "FACT [2026-09-19]: Enterprise Subscription Model Shift.",
        ],
        "observations": [
            "OBSERVATION: Strategic focus evolved from infrastructure scaling to product deployment and commercial monetization."
        ],
        "insights": [
            "INSIGHT: Microsoft AI is positioning Copilot Enterprise v2.0 as its core revenue driver while securing computing capacity."
        ],
        "limitations": [],
    }

    with patch("app.services.groq_service.GroqService.is_configured", True), \
         patch("app.services.groq_service.GroqService.generate_analysis", return_value=mock_gemini_analysis), \
         patch("app.services.gemini_service.GeminiService.is_configured", True), \
         patch("app.services.gemini_service.GeminiService.generate_analysis", return_value=mock_gemini_analysis):

        analyze_res = client.post(
            "/api/v1/analyze",
            json={
                "query": "What has Microsoft AI done in the last 90 days and what patterns can be observed?",
                "competitor_id": comp_id,
            },
        )
        assert analyze_res.status_code == 200
        analyze_data = analyze_res.json()

        assert analyze_data["status"] == "success"
        assert analyze_data["competitor"]["id"] == comp_id
        assert "Copilot Enterprise v2.0" in analyze_data["summary"]
        assert len(analyze_data["facts"]) == 3
        assert len(analyze_data["observations"]) == 1
        assert len(analyze_data["insights"]) == 1
        assert analyze_data["gemini_status"] == "connected"
        assert len(analyze_data["evidence"]) >= 3

    # -------------------------------------------------------------------------
    # 6. CLEANUP (DELETE Event & Competitor)
    # -------------------------------------------------------------------------
    del_ev_res = client.delete(f"/api/v1/events/{ev3_id}")
    assert del_ev_res.status_code == 204

    del_comp_res = client.delete(f"/api/v1/competitors/{comp_id}")
    assert del_comp_res.status_code == 204

    # Verify 404 after deletion
    get_deleted = client.get(f"/api/v1/competitors/{comp_id}")
    assert get_deleted.status_code == 404
