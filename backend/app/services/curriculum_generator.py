import json
import re

from app.config import settings
from app.core.ai_client import openai_client

_CURRICULUM_SYSTEM = """\
You are a K-12 curriculum designer. Output valid JSON only—no markdown, no explanation.

Required format:
{
  "chapters": [
    {
      "order_index": 1,
      "title": "Chapter title",
      "description": "One paragraph description",
      "learning_objectives": ["Objective 1", "Objective 2"]
    }
  ]
}

Generate 8–12 chapters that progress from foundational to advanced concepts."""

_CONTENT_SYSTEM = """\
You are an expert K-12 educator creating lesson content. Output valid JSON only—no markdown, no explanation.

Required format:
{
  "text": "Detailed lesson explanation with real-world examples...",
  "diagrams": ["flowchart LR\\n  A-->B"],
  "formulas": ["E = mc^2"],
  "key_concepts": ["Concept 1", "Concept 2"],
  "summary": "Brief one-paragraph summary"
}

For diagrams: use valid Mermaid.js syntax strings.
For formulas: use LaTeX notation."""


def _extract_json(text: str) -> dict:
    """Parse JSON from model response with fallback regex extraction."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise ValueError("Could not parse JSON from model response")


async def generate_curriculum(
    subject_name: str,
    grade: str,
    background: str | None,
    difficulty_level: str,
) -> dict:
    """Generate ordered chapters for a subject using OpenAI. Retries once on parse failure."""
    user_prompt = (
        f"Create a curriculum for:\n"
        f"Subject: {subject_name}\n"
        f"Grade: {grade}\n"
        f"Difficulty: {difficulty_level}\n"
        f"Student background: {background or 'Standard K-12 student'}\n\n"
        "Return only valid JSON."
    )

    for attempt in range(2):
        response = await openai_client.chat.completions.create(
            model=settings.llm_model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": _CURRICULUM_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        )
        try:
            return _extract_json(response.choices[0].message.content or "")
        except (ValueError, IndexError):
            if attempt == 1:
                raise


async def generate_chapter_content(
    chapter_title: str,
    chapter_description: str,
    subject_name: str,
    grade: str,
    student_background: str | None,
) -> dict:
    """Generate lesson content (text, diagrams, formulas) for a single chapter."""
    user_prompt = (
        f"Create lesson content for:\n"
        f"Chapter: {chapter_title}\n"
        f"Description: {chapter_description}\n"
        f"Subject: {subject_name}\n"
        f"Grade: {grade}\n"
        f"Student background: {student_background or 'Standard K-12 student'}\n\n"
        "Return only valid JSON."
    )

    for attempt in range(2):
        response = await openai_client.chat.completions.create(
            model=settings.llm_model,
            max_tokens=8192,
            messages=[
                {"role": "system", "content": _CONTENT_SYSTEM},
                {"role": "user", "content": user_prompt},
            ],
        )
        try:
            return _extract_json(response.choices[0].message.content or "")
        except (ValueError, IndexError):
            if attempt == 1:
                raise
