def test_health_check(client):
    """Test health check endpoints."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "competitive-intelligence-agent"
    assert data["database"] == "connected"

    alias_response = client.get("/api/health")
    assert alias_response.status_code == 200
    assert alias_response.json()["database"] == "connected"
