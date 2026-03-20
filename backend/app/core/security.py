from app.config import settings
from app.core.supabase_client import get_supabase_client


def verify_supabase_jwt(token: str) -> dict | None:
    """Verify a Supabase-issued JWT via the Supabase Auth API and return the user payload."""
    try:
        client = get_supabase_client()
        response = client.auth.get_user(token)
        if response and response.user:
            user = response.user
            return {
                "sub": str(user.id),
                "email": user.email,
                "role": "authenticated",
            }
        return None
    except Exception:
        return None


# Explicit alias for WebSocket use (JWT arrives via query param, not header)
verify_supabase_jwt_ws = verify_supabase_jwt
