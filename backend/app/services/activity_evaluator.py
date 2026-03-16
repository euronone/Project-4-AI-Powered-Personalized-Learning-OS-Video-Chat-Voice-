import json
import re

from app.config import settings
from app.core.ai_client import claude_client

_EVALUATE_SYSTEM = """\
You are an expert K-12 educator grading a student submission. Output valid JSON only—no markdown, no explanation.

Required format:
{
  "score": <integer 0-100>,
  "correctness": {"<question_key>": <true|false>, ...},
  "feedback": "<detailed explanation of what was right and wrong>",
  "guidance": "<what the student should study or revisit>"
}

Be encouraging and constructive. Never be harsh. Grade fairly for the student's grade level."""

_GENERATE_SYSTEM = """\
You are an expert K-12 educator creating assessment activities. Output valid JSON only—no markdown, no explanation.

Required format:
{
  "activities": [
    {
      "type": "<quiz|problem_set|experiment|diagram_exercise>",
      "prompt": {
        "instructions": "<clear activity instructions>",
        "questions": [{"id": "q1", "text": "<question>", "type": "<mcq|short_answer|calculation>"}]
      }
    }
  ]
}

Generate 3-5 activities covering different question types to comprehensively assess the chapter."""


def _extract_json(text: str) -> dict:
    """Parse JSON from model response, with regex fallback."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Could not parse JSON from model response")


async def evaluate_submission(
    activity_prompt: dict,
    student_response: dict,
    student_grade: str,
) -> dict:
    """Evaluate a student's activity submission using Claude.

    Returns score (0-100), correctness map, feedback, and guidance.
    """
    user_prompt = (
        f"Grade level: {student_grade}\n\n"
        f"Activity instructions:\n{json.dumps(activity_prompt, indent=2)}\n\n"
        f"Student's response:\n{json.dumps(student_response, indent=2)}\n\n"
        "Return only valid JSON."
    )

    for attempt in range(2):
        message = await claude_client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=_EVALUATE_SYSTEM,
            messages=[{"role": "user", "content": user_prompt}],
        )
        try:
            result = _extract_json(message.content[0].text)
            # Clamp score to valid range
            result["score"] = max(0, min(100, int(result.get("score", 0))))
            return result
        except (ValueError, IndexError):
            if attempt == 1:
                raise


async def generate_activities(chapter_content: dict, subject_name: str, grade: str) -> list[dict]:
    """Generate 3-5 assessment activities for a chapter using Claude."""
    user_prompt = (
        f"Subject: {subject_name}\n"
        f"Grade: {grade}\n\n"
        f"Chapter key concepts: {', '.join(chapter_content.get('key_concepts', []))}\n"
        f"Chapter summary: {chapter_content.get('summary', '')[:500]}\n\n"
        "Return only valid JSON."
    )

    for attempt in range(2):
        message = await claude_client.messages.create(
            model=settings.claude_model,
            max_tokens=2048,
            system=_GENERATE_SYSTEM,
            messages=[{"role": "user", "content": user_prompt}],
        )
        try:
            result = _extract_json(message.content[0].text)
            return result.get("activities", [])
        except (ValueError, IndexError):
            if attempt == 1:
                raise
