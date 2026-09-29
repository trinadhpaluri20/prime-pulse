import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime


def test_create_event_retains_memory_in_hindsight(client):
    """Test creating an event persists DB record and triggers Hindsight memory retention."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Nexus Dynamics", "industry": "Cloud"})
    comp_id = comp_resp.json()["id"]

    event_payload = {
        "category": "pricing",
        "title": "Slashed Enterprise API Pricing by 25%",
        "description": "Announced major price cut targeting enterprise market.",
        "event_date": "2026-09-28T10:00:00Z",
        "previous_value": "$1000/mo",
        "new_value": "$750/mo",
        "importance": "high",
        "source": {
            "name": "Official Press Release",
            "url": "https://nexus.example.com/pr/pricing",
            "source_type": "press_release"
        }
    }

    with patch("app.services.event_service.HindsightMemoryService") as MockHindsightService:
        mock_service_instance = MagicMock()
        mock_service_instance.is_configured = True
        mock_service_instance.retain.return_value = {"status": "retained"}
        MockHindsightService.return_value = mock_service_instance

        response = client.post(f"/api/v1/competitors/{comp_id}/events", json=event_payload)
        assert response.status_code == 201
        data = response.json()

        # 1. DB persistence check
        assert data["id"] is not None
        assert data["competitor_id"] == comp_id
        assert data["title"] == "Slashed Enterprise API Pricing by 25%"

        # 2. Hindsight Memory status check
        assert "memory" in data
        assert data["memory"]["status"] == "retained"
        expected_doc_id = f"event-{comp_id}-{data['id']}"
        assert data["memory"]["document_id"] == expected_doc_id

        # 3. Verify mock call parameters
        mock_service_instance.retain.assert_called_once()
        _, kwargs = mock_service_instance.retain.call_args

        assert kwargs["document_id"] == expected_doc_id
        assert kwargs["context"] == "competitor_event"
        assert "Nexus Dynamics" in kwargs["content"]
        assert "Slashed Enterprise API Pricing by 25%" in kwargs["content"]
        assert kwargs["metadata"]["competitor_id"] == str(comp_id)
        assert kwargs["metadata"]["competitor_name"] == "Nexus Dynamics"
        assert kwargs["metadata"]["category"] == "pricing"


def test_deterministic_document_id_format(client):
    """Test document_id remains deterministic across creation and updates."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Deterministic Corp"})
    comp_id = comp_resp.json()["id"]

    event_resp = client.post(
        f"/api/v1/competitors/{comp_id}/events",
        json={
            "category": "product",
            "title": "v1.0 Release",
            "description": "Initial release",
            "event_date": "2026-09-01T00:00:00Z"
        }
    )
    event_id = event_resp.json()["id"]
    expected_doc_id = f"event-{comp_id}-{event_id}"

    with patch("app.services.event_service.HindsightMemoryService") as MockHindsightService:
        mock_service_instance = MagicMock()
        mock_service_instance.is_configured = True
        MockHindsightService.return_value = mock_service_instance

        # Update event
        update_resp = client.put(
            f"/api/v1/events/{event_id}",
            json={"title": "v1.0 Release (Updated)"}
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["memory"]["document_id"] == expected_doc_id

        _, kwargs = mock_service_instance.retain.call_args
        assert kwargs["document_id"] == expected_doc_id


def test_create_event_when_hindsight_not_configured(client):
    """Test DB event creation succeeds cleanly when Hindsight is not configured."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Offline Corp"})
    comp_id = comp_resp.json()["id"]

    with patch("app.services.event_service.HindsightMemoryService") as MockHindsightService:
        mock_service_instance = MagicMock()
        mock_service_instance.is_configured = False
        MockHindsightService.return_value = mock_service_instance

        response = client.post(
            f"/api/v1/competitors/{comp_id}/events",
            json={
                "category": "hiring",
                "title": "Hired Chief AI Officer",
                "description": "Expanded executive leadership team.",
                "event_date": "2026-09-28T00:00:00Z"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["id"] is not None
        assert data["memory"]["status"] == "not_configured"
        assert data["memory"]["document_id"] == f"event-{comp_id}-{data['id']}"


def test_create_event_when_hindsight_fails(client):
    """Test DB event creation persists DB record even if Hindsight retention fails."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Resilient Corp"})
    comp_id = comp_resp.json()["id"]

    with patch("app.services.event_service.HindsightMemoryService") as MockHindsightService:
        mock_service_instance = MagicMock()
        mock_service_instance.is_configured = True
        mock_service_instance.retain.side_effect = Exception("Hindsight service timeout")
        MockHindsightService.return_value = mock_service_instance

        response = client.post(
            f"/api/v1/competitors/{comp_id}/events",
            json={
                "category": "acquisition",
                "title": "Acquired Startup X",
                "description": "Acquired leading computer vision startup.",
                "event_date": "2026-09-28T00:00:00Z"
            }
        )
        assert response.status_code == 201
        data = response.json()
        event_id = data["id"]
        assert data["memory"]["status"] == "failed"
        assert data["memory"]["error"] == "Memory retention failed"

        # Verify DB record was saved and exists
        get_resp = client.get(f"/api/v1/events/{event_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["title"] == "Acquired Startup X"


def test_sync_event_memory_endpoint(client):
    """Test manually syncing Hindsight memory for an existing event."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Sync Test Corp"})
    comp_id = comp_resp.json()["id"]

    event_resp = client.post(
        f"/api/v1/competitors/{comp_id}/events",
        json={
            "category": "funding",
            "title": "Raised $50M Series B",
            "description": "Funding led by major venture capital firm.",
            "event_date": "2026-09-28T00:00:00Z"
        }
    )
    event_id = event_resp.json()["id"]

    with patch("app.services.event_service.HindsightMemoryService") as MockHindsightService:
        mock_service_instance = MagicMock()
        mock_service_instance.is_configured = True
        mock_service_instance.retain.return_value = {"status": "retained"}
        MockHindsightService.return_value = mock_service_instance

        sync_resp = client.post(f"/api/v1/events/{event_id}/sync-memory")
        assert sync_resp.status_code == 200
        assert sync_resp.json()["memory"]["status"] == "retained"
        assert sync_resp.json()["memory"]["document_id"] == f"event-{comp_id}-{event_id}"
