def test_health_check(client):
    """Test health check endpoints."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "competitive-intelligence-agent"
    assert data["database"] == "connected"
    assert "gemini" in data

    alias_response = client.get("/api/health")
    assert alias_response.status_code == 200
    assert alias_response.json()["database"] == "connected"
