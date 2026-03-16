import logging
from collections.abc import AsyncGenerator

from app.config import settings
from app.core.ai_client import claude_client

logger = logging.getLogger(__name__)

_SYSTEM_TEMPLATE = """\
You are an expert K-12 tutor for a grade {grade} student.

Teaching principles:
- Use the Socratic method: guide with questions rather than giving direct answers
- Explain step-by-step using grade-appropriate analogies and examples
- After explaining a concept, ask a short question to verify understanding
- Be encouraging, patient, and positive
- Never solve homework or activity problems outright-guide the student to discover answers
- Keep responses concise and clear

Student background: {background}

Current chapter-key concepts: {key_concepts}
Chapter overview: {chapter_text}"""


def _build_messages(
    student_message: str,
    conversation_history: list[dict],
    chapter_content: dict | None,
) -> list[dict]:
    """Build Claude messages from prior conversation and optional chapter context."""
    messages: list[dict] = []

    context_parts = []
    if chapter_content:
        context_parts.append(
            f"[Current chapter: {chapter_content.get('title', 'Unknown')}]\n"
            f"[Key concepts: {', '.join(chapter_content.get('key_concepts', []))}]"
        )

    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    if not messages and context_parts:
        prefixed = "\n".join(context_parts) + "\n\n" + student_message
        messages.append({"role": "user", "content": prefixed})
    else:
        messages.append({"role": "user", "content": student_message})

    return messages


async def stream_teaching_response(
    chapter_content: dict | None,
    student_message: str,
    conversation_history: list[dict],
    student_grade: str = "",
    student_background: str | None = None,
) -> AsyncGenerator[str, None]:
    """Stream a Socratic tutoring response from Claude."""
    safe_content = chapter_content or {}
    system_prompt = _SYSTEM_TEMPLATE.format(
        grade=student_grade or "10",
        background=student_background or "Standard K-12 student",
        key_concepts=", ".join(safe_content.get("key_concepts", [])),
        chapter_text=safe_content.get("text", "")[:2000],
    )

    messages = _build_messages(student_message, conversation_history, chapter_content)

    try:
        async with claude_client.messages.stream(
            model=settings.claude_model,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        ) as stream:
            async for chunk in stream.text_stream:
                yield chunk
    except Exception as e:
        logger.exception("Claude API streaming error")
        yield f"I'm sorry, I encountered an error processing your request. Please try again. ({type(e).__name__})"


async def get_teaching_response(
    chapter_content: dict | None,
    student_message: str,
    conversation_history: list[dict],
    student_grade: str = "",
    student_background: str | None = None,
) -> str:
    """Return a full non-streaming tutoring response from Claude."""
    safe_content = chapter_content or {}
    system_prompt = _SYSTEM_TEMPLATE.format(
        grade=student_grade or "10",
        background=student_background or "Standard K-12 student",
        key_concepts=", ".join(safe_content.get("key_concepts", [])),
        chapter_text=safe_content.get("text", "")[:2000],
    )
    messages = _build_messages(student_message, conversation_history, chapter_content)

    try:
        response = await claude_client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )
        return response.content[0].text
    except Exception as e:
        logger.exception("Claude API error")
        return f"I'm sorry, I encountered an error processing your request. Please try again. ({type(e).__name__})"
