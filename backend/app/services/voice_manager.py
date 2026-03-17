import httpx

from app.config import settings


async def create_realtime_session() -> dict:
    """Create an OpenAI Realtime API ephemeral session token.

    The browser uses the returned client_secret to connect directly to
    OpenAI Realtime, keeping the audio path out of our backend.
    Server VAD is enabled for natural turn detection.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/realtime/sessions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_realtime_model,
                "voice": "alloy",
                "modalities": ["audio", "text"],
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "silence_duration_ms": 800,
                },
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()
