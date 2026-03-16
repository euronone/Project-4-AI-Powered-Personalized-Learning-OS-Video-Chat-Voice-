import json
import logging
from collections.abc import AsyncGenerator

from app.core.ai_client import claude_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert K-12 AI tutor on the LearnOS platform. Your role is to help students learn through the Socratic method — guide them to discover answers rather than giving answers directly.

Guidelines:
- Adapt your language complexity to the student's grade level.
- Break complex concepts into small, digestible steps.
- Ask follow-up questions to check understanding before moving on.
- Use real-world analogies and examples relevant to the student's background.
- When a student is stuck, give hints rather than full solutions.
- Render math using LaTeX notation wrapped in $ or $$ delimiters.
- Suggest diagrams or visual aids when they would help understanding.
- Be encouraging and patient. Celebrate small wins.
- If a student asks something off-topic, gently redirect to the subject.
- Keep responses concise but thorough — aim for clarity over length."""


def _build_messages(
    student_message: str,
    conversation_history: list[dict],
    chapter_content: dict | None,
    student_grade: str,
    student_background: str | None,
) -> list[dict]:
    """Build the Claude messages array from conversation history and context."""
    messages: list[dict] = []

    # Inject chapter context as the first user turn if available
    context_parts = []
    if chapter_content:
        context_parts.append(
            f"[Current chapter: {chapter_content.get('title', 'Unknown')}]\n"
            f"[Key concepts: {', '.join(chapter_content.get('key_concepts', []))}]"
        )
    if student_grade:
        context_parts.append(f"[Student grade: {student_grade}]")
    if student_background:
        context_parts.append(f"[Student background: {student_background}]")

    # Replay prior conversation
    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Append the current user message (with context prefix on first turn)
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
    """Stream a teaching response using Claude API.

    Uses Socratic method — guides rather than gives answers.
    Adapts explanation depth based on student responses.
    """
    messages = _build_messages(
        student_message,
        conversation_history,
        chapter_content,
        student_grade,
        student_background,
    )

    try:
        async with claude_client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
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
    """Get a non-streaming teaching response (for simple queries)."""
    messages = _build_messages(
        student_message,
        conversation_history,
        chapter_content,
        student_grade,
        student_background,
    )

    try:
        response = await claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text
    except Exception as e:
        logger.exception("Claude API error")
        return f"I'm sorry, I encountered an error processing your request. Please try again. ({type(e).__name__})"
