import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user
from app.models.base import User


class FakeUser(User):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


def fake_current_user():
    return FakeUser(
        id="test-user-123",
        email="test@example.com",
        name="Test User",
        role="user",
        waste_diverted_kg=0.0,
    )


@pytest.fixture
def client():
    app.dependency_overrides[get_current_user] = fake_current_user
    with TestClient(app, base_url="http://localhost") as test_client:
        yield test_client
    app.dependency_overrides.clear()


class TestCheckIngredientRatio:
    def test_exact_ratio_no_warning(self, client):
        response = client.post(
            "/api/v1/check-ingredient-ratio",
            json={"waste_kg": 10, "water_liters": 33.33, "sugar_kg": 3.33},
        )
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["ideal_water_liters"] == 33.33
        assert data["ideal_sugar_kg"] == 3.33
        assert data["deviation_warning"]["has_warning"] is False

    def test_deviation_triggers_warning(self, client):
        response = client.post(
            "/api/v1/check-ingredient-ratio",
            json={"waste_kg": 10, "water_liters": 40, "sugar_kg": 5},
        )
        assert response.status_code == 200
        data = response.json()["data"]
        warning = data["deviation_warning"]
        assert warning["has_warning"] is True
        assert len(warning["warnings"]) == 2
        assert any("air" in w.lower() or "water" in w.lower() for w in warning["warnings"])
        assert any("gula" in w.lower() or "sugar" in w.lower() for w in warning["warnings"])

    def test_invalid_payload_returns_422(self, client):
        response = client.post(
            "/api/v1/check-ingredient-ratio",
            json={"waste_kg": 10},
        )
        assert response.status_code == 422
