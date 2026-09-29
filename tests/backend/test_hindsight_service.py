import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime
from app.services.hindsight_service import HindsightMemoryService
from app.utils.errors import ValidationErrorException, AppException


def test_hindsight_not_configured():
    """Test service behavior when HINDSIGHT_API_KEY is not configured."""
    service = HindsightMemoryService(api_key="")
    assert service.is_configured is False

    health = service.health_check()
    assert health["status"] == "not_configured"

    with pytest.raises(ValidationErrorException) as exc_info:
        service.retain(content="Test memory content")
    assert "Hindsight API key is not configured" in str(exc_info.value)


@patch("app.services.hindsight_service.Hindsight")
def test_hindsight_health_check_connected(mock_hindsight_class):
    """Test health check when Hindsight client connects successfully."""
    mock_instance = MagicMock()
    mock_hindsight_class.return_value = mock_instance

    service = HindsightMemoryService(api_key="test_secret_key", bank_id="test-bank")
    health = service.health_check()

    assert health["status"] == "connected"
    assert health["bank_id"] == "test-bank"
    mock_instance.recall.assert_called_once_with(
        bank_id="test-bank", query="ping", max_tokens=10
    )


@patch("app.services.hindsight_service.Hindsight")
def test_hindsight_health_check_failed(mock_hindsight_class):
    """Test health check when Hindsight connection fails."""
    mock_instance = MagicMock()
    mock_instance.recall.side_effect = Exception("Network connection error")
    mock_hindsight_class.return_value = mock_instance

    service = HindsightMemoryService(api_key="test_secret_key", bank_id="test-bank")
    health = service.health_check()

    assert health["status"] == "connection_failed"
    assert "error" in health


@patch("app.services.hindsight_service.Hindsight")
def test_hindsight_ensure_bank(mock_hindsight_class):
    """Test creating/ensuring memory bank."""
    mock_instance = MagicMock()
    mock_hindsight_class.return_value = mock_instance

    service = HindsightMemoryService(api_key="test_secret_key", bank_id="competitive-intelligence")
    result = service.ensure_bank()

    assert result["status"] == "success"
    assert result["bank_id"] == "competitive-intelligence"
    mock_instance.create_bank.assert_called_once_with(
        bank_id="competitive-intelligence",
        name="Memory Bank for competitive-intelligence",
    )


@patch("app.services.hindsight_service.Hindsight")
def test_hindsight_retain_memory(mock_hindsight_class):
    """Test memory retain abstraction call parameters."""
    mock_instance = MagicMock()
    mock_instance.retain.return_value = {"status": "ok"}
    mock_hindsight_class.return_value = mock_instance

    service = HindsightMemoryService(api_key="test_secret_key", bank_id="test-bank")
    now = datetime.now()
    result = service.retain(
        content="Competitor X launched v2.0 pricing model.",
        context="pricing_event",
        timestamp=now,
        metadata={"competitor_id": "123"},
        document_id="doc-comp-123",
        tags=["pricing", "product"],
    )

    assert result["status"] == "retained"
    assert result["bank_id"] == "test-bank"
    assert result["document_id"] == "doc-comp-123"

    mock_instance.retain.assert_called_once_with(
        bank_id="test-bank",
        content="Competitor X launched v2.0 pricing model.",
        context="pricing_event",
        timestamp=now,
        metadata={"competitor_id": "123"},
        document_id="doc-comp-123",
        tags=["pricing", "product"],
    )


@patch("app.services.hindsight_service.Hindsight")
def test_hindsight_recall_memory(mock_hindsight_class):
    """Test memory recall abstraction query and parsing."""
    mock_instance = MagicMock()
    mock_item = MagicMock()
    mock_item.text = "Competitor X dropped pricing to $100."
    mock_item.score = 0.95
    mock_item.type = "world"
    mock_item.metadata = {"competitor_id": "123"}

    mock_response = MagicMock()
    mock_response.results = [mock_item]
    mock_instance.recall.return_value = mock_response
    mock_hindsight_class.return_value = mock_instance

    service = HindsightMemoryService(api_key="test_secret_key", bank_id="test-bank")
    result = service.recall(query="pricing strategy", types=["world"], limit=5)

    assert result["query"] == "pricing strategy"
    assert result["count"] == 1
    assert result["results"][0]["text"] == "Competitor X dropped pricing to $100."
    assert result["results"][0]["score"] == 0.95

    mock_instance.recall.assert_called_once_with(
        bank_id="test-bank",
        query="pricing strategy",
        types=["world"],
        tags=None,
    )


def test_api_health_includes_hindsight(client):
    """Test API /health endpoints return hindsight status field."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "hindsight" in data
    assert data["hindsight"] in ["connected", "not_configured", "connection_failed"]


@patch("app.services.hindsight_service.Hindsight")
def test_dev_memory_test_endpoints(mock_hindsight_class, client):
    """Test dev-only memory test endpoints."""
    mock_instance = MagicMock()
    mock_instance.retain.return_value = {"status": "ok"}
    
    mock_item = MagicMock()
    mock_item.text = "Dev test memory content."
    mock_item.score = 0.88
    mock_item.type = "world"
    mock_item.metadata = {}
    mock_response = MagicMock()
    mock_response.results = [mock_item]
    mock_instance.recall.return_value = mock_response

    mock_hindsight_class.return_value = mock_instance

    # Mock settings.HINDSIGHT_API_KEY for dev test routes
    with patch("app.services.hindsight_service.settings.HINDSIGHT_API_KEY", "dev_api_key"):
        # Test Retain endpoint
        retain_resp = client.post(
            "/api/v1/memory/test",
            json={"content": "Competitor X pricing shift."}
        )
        assert retain_resp.status_code == 201
        assert "result" in retain_resp.json()

        # Test Recall endpoint
        recall_resp = client.get("/api/v1/memory/test/recall?q=pricing")
        assert recall_resp.status_code == 200
        assert recall_resp.json()["query"] == "pricing"
