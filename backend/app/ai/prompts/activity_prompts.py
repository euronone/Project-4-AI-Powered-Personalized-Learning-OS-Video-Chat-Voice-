def build_activity_prompt(
    chapter_title: str,
    chapter_content: str,
    difficulty: str,
    student_level: str
) -> str:
    """
    Builds the prompt responsible for generating contextual learning activities.
    Args:
        chapter_title (str): The title of the current chapter.
        chapter_content (str): The educational content contained in the chapter.
        difficulty (str): The target difficulty tier (e.g., intermediate, beginner).
        student_level (str): The grade level describing the target student audience.
    Returns:
        str: A strictly formatted text prompt ready for structured JSON activity generation.
    """
    system_role = (
        "You are an expert instructional designer and activity generator."
    )
    constraints = (
        "CRITICAL CONSTRAINTS:\n"
        "1. Generate exactly 3 to 5 distinct learning activities based STRICTLY on the provided chapter content.\n"
        "2. Mix the types of activities. You must use 'mcq', 'short_answer', and 'problem' formats.\n"
        "3. Focus on testing deep conceptual understanding, not bare rote memorization.\n"
        "4. Introduce relevant real-world examples in your problem and short answer structures when possible.\n"
        "5. Include detailed explanations or step-by-step solutions for every generated item.\n"
        "6. Do not hallucinate external facts.\n"
        "7. Ensure the language matches the indicated student level and the complexity matches the desired difficulty.\n"
        "8. Output MUST map perfectly to structured JSON format.\n"
    )
    prompt = (
        f"{system_role}\n"
        f"{constraints}\n\n"
        f"--- CONTEXT ---\n"
        f"CHAPTER TITLE: {chapter_title}\n"
        f"STUDENT LEVEL: {student_level}\n"
        f"TARGET DIFFICULTY: {difficulty}\n"
        f"----------------\n\n"
        f"--- CHAPTER CONTENT ---\n"
        f"{chapter_content}\n"
        f"-----------------------\n\n"
        f"TASK:\n"
        f"Generate the activities ensuring a mix of multiple choice (options, correct_answer), short answers (expected_answer), and problem sets (solution, steps)."
    )
    return prompt
