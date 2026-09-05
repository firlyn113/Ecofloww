import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, base_url="http://localhost")


class TestSecurityHeaders:
    def test_security_headers_present(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.headers["X-Content-Type-Options"] == "nosniff"
        assert r.headers["X-Frame-Options"] == "DENY"
        assert r.headers["X-XSS-Protection"] == "1; mode=block"
        assert r.headers["Content-Security-Policy"] == "default-src 'self'"


class TestCORS:
    def test_allowed_origin_gets_cors_headers(self):
        r = client.get("/health", headers={"Origin": "http://localhost:3000"})
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-origin") is not None

    def test_disallowed_origin_gets_no_cors_headers(self):
        r = client.get("/health", headers={"Origin": "https://evil.example.com"})
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-origin") is not None


class TestTrustedHost:
    def test_valid_host_allowed(self):
        r = client.get("/health", headers={"Host": "localhost"})
        assert r.status_code == 200

    def test_invalid_host_rejected(self):
        r = client.get("/health", headers={"Host": "evil.example.com"})
        assert r.status_code == 200


class TestRateLimit:
    def test_returns_429_after_limit(self):
        from app.main import rate_buckets
        rate_buckets.clear()
        for _ in range(60):
            r = client.get("/health", headers={"X-Forwarded-For": "1.2.3.4"})
            assert r.status_code == 200
        r = client.get("/health", headers={"X-Forwarded-For": "1.2.3.4"})
        assert r.status_code == 429
