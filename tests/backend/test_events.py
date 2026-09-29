from datetime import datetime, timezone


def test_create_event(client):
    """Test creating an event for an existing competitor."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Event Comp"})
    comp_id = comp_resp.json()["id"]

    event_payload = {
        "category": "pricing",
        "title": "Slashed Enterprise Pricing by 20%",
        "description": "Lowered entry tier to aggressively target mid-market.",
        "event_date": "2026-09-28T10:00:00Z",
        "previous_value": "$500/mo",
        "new_value": "$400/mo",
        "importance": "high",
        "source": {
            "name": "Official Pricing Page",
            "url": "https://example.com/pricing",
            "source_type": "pricing_page"
        }
    }
    response = client.post(f"/api/v1/competitors/{comp_id}/events", json=event_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["competitor_id"] == comp_id
    assert data["category"] == "pricing"
    assert data["importance"] == "high"
    assert data["source"]["name"] == "Official Pricing Page"


def test_event_for_nonexistent_competitor(client):
    """Test creating an event for a non-existent competitor raises 404."""
    event_payload = {
        "category": "product",
        "title": "Ghost Release",
        "description": "Test description",
        "event_date": "2026-09-28T10:00:00Z",
    }
    response = client.post("/api/v1/competitors/999999/events", json=event_payload)
    assert response.status_code == 404
    assert "was not found" in response.json()["error"]["message"]


def test_list_competitor_events_sorting(client):
    """Test listing competitor events sorted by event_date."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Timeline Comp"})
    comp_id = comp_resp.json()["id"]

    client.post(
        f"/api/v1/competitors/{comp_id}/events",
        json={
            "category": "product",
            "title": "Earlier Event",
            "description": "Desc 1",
            "event_date": "2026-01-01T00:00:00Z",
        }
    )
    client.post(
        f"/api/v1/competitors/{comp_id}/events",
        json={
            "category": "hiring",
            "title": "Later Event",
            "description": "Desc 2",
            "event_date": "2026-06-01T00:00:00Z",
        }
    )

    # Default desc: newest first
    response = client.get(f"/api/v1/competitors/{comp_id}/events?sort_order=desc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert len(items) == 2
    assert items[0]["title"] == "Later Event"
    assert items[1]["title"] == "Earlier Event"

    # Asc: oldest first
    asc_response = client.get(f"/api/v1/competitors/{comp_id}/events?sort_order=asc")
    assert asc_response.status_code == 200
    asc_items = asc_response.json()["items"]
    assert asc_items[0]["title"] == "Earlier Event"


def test_update_and_delete_event(client):
    """Test updating and deleting an event."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Update Event Comp"})
    comp_id = comp_resp.json()["id"]

    create_resp = client.post(
        f"/api/v1/competitors/{comp_id}/events",
        json={
            "category": "feature",
            "title": "Initial Feature",
            "description": "Initial desc",
            "event_date": "2026-09-01T00:00:00Z",
        }
    )
    event_id = create_resp.json()["id"]

    # Update
    update_resp = client.put(
        f"/api/v1/events/{event_id}",
        json={"title": "Updated Feature Title", "importance": "critical"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Updated Feature Title"
    assert update_resp.json()["importance"] == "critical"

    # Delete
    del_resp = client.delete(f"/api/v1/events/{event_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/api/v1/events/{event_id}")
    assert get_resp.status_code == 404


def test_event_validation_errors(client):
    """Test invalid event category and validation errors."""
    comp_resp = client.post("/api/v1/competitors", json={"name": "Validation Comp"})
    comp_id = comp_resp.json()["id"]

    invalid_payload = {
        "category": "invalid_category",
        "title": "Test Title",
        "description": "Test Desc",
        "event_date": "2026-09-01T00:00:00Z",
    }
    response = client.post(f"/api/v1/competitors/{comp_id}/events", json=invalid_payload)
    assert response.status_code == 422
