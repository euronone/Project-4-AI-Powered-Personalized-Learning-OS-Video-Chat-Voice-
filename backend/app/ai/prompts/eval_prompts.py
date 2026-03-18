def build_evaluation_prompt(
    question: str,
    expected_answer: str,
    student_response: str
) -> str:
    """
    Builds the prompt utilized for interpreting a student's answer against the expected correct response.
    Args:
        question (str): Textual analysis, parameters, or direct references to an image frame.
        expected_answer (str): Textual analysis, parameters, or direct references to an image frame.
        student_response (str): Textual analysis, parameters, or direct references to an image frame.
    Returns:
        str: A concise text prompt optimized for deterministic schema mapping.
    """
    system_role = (
        "You are an objective computer vision analysis tool parsing facial expressions and learning engagement."
    )
    constraints = (
        "CRITICAL CONSTRAINTS:\n"
        "1. Analyze the primary affective state present in the given frame.\n"
        "2. You MUST select exactly one label from: engaged, confused, bored, frustrated, happy, drowsy, or neutral.\n"
        "3. Assign a confidence score from 0.0 to 1.0 indicating your tracking certainty.\n"
        "4. Your output MUST be extremely fast and short. Absolutely no lengthy conversational preamble is allowed.\n"
        "5. Output must map strictly to JSON.\n"
    )
    prompt = (
        f"{system_role}\n"
        f"{constraints}\n\n"
        f"--- IMAGE CONTEXT ---\n"
        f"123\n"
        f"---------------------\n\n"
        f"TASK:\n"
        f"Return the emotion label and confidence score."
    )
    return prompt
