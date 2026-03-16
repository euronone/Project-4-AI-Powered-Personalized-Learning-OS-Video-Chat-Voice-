from collections.abc import AsyncGenerator

from app.config import settings
from app.core.ai_client import claude_client

_SYSTEM_TEMPLATE = """\
You are an expert K-12 tutor for a grade {grade} student.

Teaching principles:
- Use the Socratic method: guide with questions rather than giving direct answers
- Explain step-by-step using grade-appropriate analogies and examples
- After explaining a concept, ask a short question to verify understanding
- Be encouraging, patient, and positive
- Never solve homework or activity problems outright\u2014guide the student to discover answers
- Keep responses concise and clear

Student background: {background}

Current chapter\u2014key concepts: {key_concepts}
Chapter overview: {chapter_text}"""


async def stream_teaching_response(
    chapter_content: dict,
    student_message: str,
    conversation_history: list[dict],
    student_grade: str,
    student_background: str | None,
) -> AsyncGenerator[str, None]:
    """Stream a Socratic tutoring response from Claude."""
    system_prompt = _SYSTEM_TEMPLATE.format(
        grade=student_grade,
        background=student_background or "Standard K-12 student",
        key_concepts=", ".join(chapter_content.get("key_concepts", [])),
        # Cap chapter text to keep context window reasonable
        chapter_text=chapter_content.get("text", "")[:2000],
    )

    messages = [*conversation_history, {"role": "user", "content": student_message}]

    async with claude_client.messages.stream(
        model=settings.claude_model,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    ) as stream:
        async for chunk in stream.text_stream:
            yield chunk

