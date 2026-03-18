def build_curriculum_prompt(
    grade: str,
    subject: str,
    student_background: str
) -> str:
    """
    Builds the structural prompt to generate a JSON personalized learning curriculum.
    Args:
        grade (str): The target grade level for the curriculum.
        subject (str): The subject matter to generate (e.g., Mathematics, Biology).
        student_background (str): Summary of any relevant background knowledge the student possesses.
    Returns:
        str: A formatted prompt optimized for generating a structured K-12 curriculum.
    """
    system_role = (
        "You are an expert K-12 curriculum designer creating highly structured, personalized educational paths."
    )
    constraints = (
        "CRITICAL CONSTRAINTS:\n"
        "1. Ensure the curriculum strictly aligns with general K-12 educational standards appropriate for the exact grade level provided.\n"
        "2. Produce a logical progression of chapters flowing from foundational concepts to advanced applications.\n"
        "3. Ensure the estimated difficulty correctly reflects the target student profile.\n"
        "4. Your output MUST be strictly deterministic and map gracefully into JSON.\n"
        "5. Do not include hallucinated complexity or subjects outside the specified scope.\n"
    )
    prompt = (
        f"{system_role}\n"
        f"{constraints}\n\n"
        f"--- TARGET PARAMETERS ---\n"
        f"SUBJECT: {subject}\n"
        f"GRADE LEVEL: {grade}\n"
        f"STUDENT BACKGROUND: {student_background}\n"
        f"-------------------------\n\n"
        f"TASK:\n"
        f"Generate a full curriculum containing:\n"
        f"- The subject name\n"
        f"- A brief summary of the path\n"
        f"- The expected difficulty level\n"
        f"- An ordered list of chapters. Each chapter must feature a 	itle, description, learning_objectives (list of strings), and an order_index.\n"
    )
    return prompt
