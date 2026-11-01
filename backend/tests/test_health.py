from fastapi.testclient import TestClient

from app.main import app


def test_health_exposes_no_sensitive_configuration() -> None:
    response = TestClient(app).get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "mypaisaa-prediction-api"
    assert "api_key" not in str(body).lower()
