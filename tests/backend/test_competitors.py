def test_create_competitor(client):
    """Test creating a new competitor."""
    payload = {
        "name": "Alpha Corp",
        "description": "Enterprise AI leader",
        "industry": "AI Software",
        "website": "https://alpha.example.com"
    }
    response = client.post("/api/v1/competitors", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == "Alpha Corp"
    assert data["industry"] == "AI Software"


def test_get_competitor(client):
    """Test retrieving a competitor by ID."""
    create_resp = client.post(
        "/api/v1/competitors",
        json={"name": "Beta Systems", "industry": "Cloud Computing"}
    )
    competitor_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/competitors/{competitor_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Beta Systems"


def test_get_nonexistent_competitor(client):
    """Test getting a competitor that does not exist."""
    response = client.get("/api/v1/competitors/999999")
    assert response.status_code == 404
    assert "was not found" in response.json()["error"]["message"]


def test_list_competitors(client):
    """Test paginated competitor listing."""
    client.post("/api/v1/competitors", json={"name": "Comp 1"})
    client.post("/api/v1/competitors", json={"name": "Comp 2"})

    response = client.get("/api/v1/competitors?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 2


def test_update_competitor(client):
    """Test updating a competitor."""
    create_resp = client.post("/api/v1/competitors", json={"name": "Gamma Inc"})
    competitor_id = create_resp.json()["id"]

    update_payload = {"name": "Gamma Enterprise", "industry": "FinTech"}
    response = client.put(f"/api/v1/competitors/{competitor_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Gamma Enterprise"
    assert response.json()["industry"] == "FinTech"


def test_delete_competitor(client):
    """Test deleting a competitor."""
    create_resp = client.post("/api/v1/competitors", json={"name": "Delta LLC"})
    competitor_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/competitors/{competitor_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/competitors/{competitor_id}")
    assert get_resp.status_code == 404


def test_duplicate_competitor_validation(client):
    """Test duplicate competitor name raises validation error."""
    client.post("/api/v1/competitors", json={"name": "Unique Corp"})
    response = client.post("/api/v1/competitors", json={"name": "Unique Corp"})
    assert response.status_code == 422
    assert "already exists" in response.json()["error"]["message"]
