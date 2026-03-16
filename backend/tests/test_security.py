"""Unit tests for JWT verification (no network, no DB)."""
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from jose import jwt

from app.core.security import verify_supabase_jwt, verify_supabase_jwt_ws

_SECRET = "test-secret-long-enough-for-hmac-sha256-algorithm"
_AUDIENCE = "authenticated"


def _make_token(
    secret: str = _SECRET,
    expired: bool = False,
    audience: str = _AUDIENCE,
) -> str:
    now = datetime.now(timezone.utc)
    exp = now - timedelta(hours=1) if expired else now + timedelta(hours=1)
    return jwt.encode(
        {"sub": "user-123", "email": "t@t.com", "aud": audience, "exp": exp},
        secret,
        algorithm="HS256",
    )


def test_valid_token_returns_payload():
    token = _make_token()
    with patch("app.core.security.settings") as s:
        s.supabase_jwt_secret = _SECRET
        result = verify_supabase_jwt(token)
    assert result is not None
    assert result["sub"] == "user-123"


def test_expired_token_returns_none():
    token = _make_token(expired=True)
    with patch("app.core.security.settings") as s:
        s.supabase_jwt_secret = _SECRET
        result = verify_supabase_jwt(token)
    assert result is None


def test_wrong_secret_returns_none():
    token = _make_token()
    with patch("app.core.security.settings") as s:
        s.supabase_jwt_secret = "completely-wrong-secret-key-here"
        result = verify_supabase_jwt(token)
    assert result is None


def test_wrong_audience_returns_none():
    token = _make_token(audience="anon")
    with patch("app.core.security.settings") as s:
        s.supabase_jwt_secret = _SECRET
        result = verify_supabase_jwt(token)
    assert result is None


def test_garbage_token_returns_none():
    with patch("app.core.security.settings") as s:
        s.supabase_jwt_secret = _SECRET
        result = verify_supabase_jwt("not.a.valid.token")
    assert result is None


def test_ws_alias_is_same_function():
    """verify_supabase_jwt_ws must be the same callable (no divergence risk)."""
    assert verify_supabase_jwt_ws is verify_supabase_jwt
