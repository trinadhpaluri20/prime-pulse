import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_endpoints():
    print("Testing /api/health...")
    res = client.get("/api/health")
    print(f"Health: {res.status_code}, {res.json()}")
    assert res.status_code == 200
    assert res.json()["service"] == "Competitive Intern API"

    print("Testing /api/competitors...")
    res = client.get("/api/competitors")
    print(f"Competitors: {res.status_code}, count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) >= 4

    print("Testing /api/dashboard/summary...")
    res = client.get("/api/dashboard/summary")
    print(f"Dashboard summary: {res.status_code}, {res.json()}")
    assert res.status_code == 200
    data = res.json()
    assert "competitors_tracked" in data
    assert "changes_detected" in data
    assert "patterns_detected" in data
    assert "active_alerts" in data

    print("Testing /api/dashboard/activity...")
    res = client.get("/api/dashboard/activity?timeframe=6M")
    print(f"Dashboard activity 6M: {res.status_code}, items: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) == 6

    print("Testing /api/activities...")
    res = client.get("/api/activities")
    print(f"Activities: {res.status_code}, count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) >= 30

    print("Testing /api/timeline...")
    res = client.get("/api/timeline")
    print(f"Timeline: {res.status_code}, count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) >= 30

    print("Testing /api/insights...")
    res = client.get("/api/insights")
    print(f"Insights: {res.status_code}, count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) >= 7

    ins_id = res.json()[0]["id"]
    print(f"Testing /api/insights/{ins_id}/evidence...")
    res_ev = client.get(f"/api/insights/{ins_id}/evidence")
    print(f"Insight evidence: {res_ev.status_code}, {res_ev.json().get('title')}")
    assert res_ev.status_code == 200

    print("Testing /api/alerts...")
    res = client.get("/api/alerts")
    print(f"Alerts: {res.status_code}, count: {len(res.json())}")
    assert res.status_code == 200
    assert len(res.json()) >= 5

    alert_id = res.json()[0]["id"]
    print(f"Testing /api/alerts/{alert_id}/read...")
    res_read = client.patch(f"/api/alerts/{alert_id}/read", json={"is_read": True})
    print(f"Alert read patch: {res_read.status_code}")
    assert res_read.status_code == 200

    print("Testing /api/alerts/read-all...")
    res_all = client.patch("/api/alerts/read-all")
    print(f"Alerts read-all: {res_all.status_code}, {res_all.json()}")
    assert res_all.status_code == 200

    print("Testing /api/chat...")
    res = client.post("/api/chat", json={"query": "What is Competitor A planning next?"})
    print(f"Chat: {res.status_code}, {res.json().get('answer')[:50]}...")
    assert res.status_code == 200
    assert "answer" in res.json()
    assert "confidence" in res.json()

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_endpoints()
