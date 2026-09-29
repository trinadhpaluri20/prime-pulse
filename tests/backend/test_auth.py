import pytest
from fastapi.testclient import TestClient


def test_signup_and_login_flow(client: TestClient):
    """Test user signup, duplicate signup error, login, and /auth/me endpoint."""
    user_data = {
        "email": "testuser@example.com",
        "full_name": "Test Analyst",
        "password": "Password123!",
    }

    # 1. Signup
    signup_res = client.post("/api/v1/auth/signup", json=user_data)
    assert signup_res.status_code == 201
    token_data = signup_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["email"] == "testuser@example.com"
    token = token_data["access_token"]

    # 2. Duplicate Signup Error
    dup_res = client.post("/api/v1/auth/signup", json=user_data)
    assert dup_res.status_code in [400, 422]

    # 3. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Get Current User (/auth/me)
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@example.com"
    assert me_res.json()["full_name"] == "Test Analyst"
