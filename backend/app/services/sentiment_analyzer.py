import json
import re

from app.core.ai_client import openai_client
from app.config import settings

_VALID_EMOTIONS = {"engaged", "confused", "bored", "frustrated", "happy", "drowsy"}

_SYSTEM_PROMPT = (
    "You are a student engagement analyzer. "
    "Given a screenshot of a student's face during an online lesson, "
    "classify their emotional state and return ONLY valid JSON, nothing else. "
    "Output format: {\"emotion\": \"<one of: engaged|confused|bored|frustrated|happy|drowsy>\", "
    "\"confidence\": <float 0.0-1.0>}"
)


def _extract_json(text: str) -> dict:
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        match = re.search(r"\{.*?\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError(f"No JSON found in response: {text!r}")


async def analyze_frame(frame_base64: str) -> dict:
    """Analyze a video frame for student sentiment using GPT-4o Vision.

    Detects: engagement, confusion, boredom, frustration, happiness, drowsiness.
    Returns a dict with 'emotion' and 'confidence' keys.
    """
    response = await openai_client.chat.completions.create(
        model=settings.openai_vision_model,
        max_tokens=64,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{frame_base64}",
                            "detail": "low",
                        },
                    },
                    {"type": "text", "text": "Analyze the student's emotional state."},
                ],
            },
        ],
    )

    result = _extract_json(response.choices[0].message.content or "")
    emotion = result.get("emotion", "engaged")
    if emotion not in _VALID_EMOTIONS:
        emotion = "engaged"
    confidence = float(result.get("confidence", 0.5))
    confidence = max(0.0, min(1.0, confidence))
    return {"emotion": emotion, "confidence": confidence}


def determine_adaptive_action(emotion: str, confidence: float) -> str | None:
    """Determine what adaptive action to take based on detected sentiment."""
    if confidence < 0.6:
        return None

    actions = {
        "bored": "Simplify content and add interactive elements. Consider suggesting a break.",
        "confused": "Slow down and re-explain with different examples and analogies.",
        "frustrated": "Offer encouragement and break the problem into smaller steps.",
        "drowsy": "Suggest a physical activity break or switch to interactive mode.",
    }
    return actions.get(emotion)
