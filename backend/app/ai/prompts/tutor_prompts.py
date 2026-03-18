from typing import List
def build_tutor_prompt(
    student_message: str,
    chat_history: List[str],
    chapter_content: str,
    retrieved_context: str = ""
) -> str:
    """
    Builds a structured prompt for the Socratic teaching AI.
    Args:
        student_message (str): The current message input from the student.
        chat_history (list[str]): Formatted list of past conversation turns.
        chapter_content (str): Educational context material for the current chapter.
        retrieved_context (str): Relevant context retrieved from RAG system.
    Returns:
        str: A fully formatted prompt containing system rules, context, and immediate task.
    """
    system_role = (
        "You are an encouraging, expert AI tutor interacting directly with a student.\n"
        "Your primary goal is to guide the student towards understanding the material using the Socratic method.\n"
    )
    constraints = (
        "CRITICAL CONSTRAINTS:\n"
        "1. DO NOT directly give answers to problems or state facts if the student can logically deduce them.\n"
        "2. Always ask guiding questions to help the student find the answer themselves.\n"
        "3. Break down complex topics into smaller, digestible steps.\n"
        "4. Acknowledge and validate correct reasoning, then softly prompt the next logical step.\n"
        "5. Keep responses concise, supportive, interactive, and entirely focused on the current chapter concepts.\n"
        "6. Do not hallucinate external facts.\n"
    )
    history_str = "\n".join(chat_history) if chat_history else "No previous history."
    rag_section = ""
    if retrieved_context:
        rag_section = (
            f"Relevant knowledge context:\n"
            f"{retrieved_context}\n"
            f"-------------------------------\n\n"
        )
    prompt = (
        f"{system_role}\n"
        f"{constraints}\n\n"
        f"--- CURRENT CHAPTER CONTENT ---\n"
        f"{chapter_content}\n"
        f"-------------------------------\n\n"
        f"{rag_section}"
        f"--- CONVERSATION HISTORY ---\n"
        f"{history_str}\n"
        f"----------------------------\n\n"
        f"TASK: Respond to the student's latest message appropriately based on the rules.\n\n"
        f"STUDENT MESSAGE:\n"
        f"{student_message}\n\n"
        f"TUTOR RESPONSE:"
    )
    return prompt
