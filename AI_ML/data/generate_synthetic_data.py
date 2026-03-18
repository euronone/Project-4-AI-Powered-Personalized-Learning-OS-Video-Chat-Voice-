"""
Generates realistic synthetic data for the LearnOS recommendation engine.

Produces five CSV files under data/synthetic/:
  - students.csv        500 student profiles
  - subjects.csv        15 subjects with tags & metadata
  - chapters.csv        ~150 chapters across all subjects
  - interactions.csv    8 000 student-chapter interaction rows
  - sentiment.csv       sentiment log samples tied to interactions

Run:
    python -m data.generate_synthetic_data          (from AI_ML/)
    python AI_ML/data/generate_synthetic_data.py    (from project root)
"""

import sys, uuid, random
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from config import (
    DATA_DIR, NUM_STUDENTS, SUBJECT_CATALOG, CHAPTERS_PER_SUBJECT,
    NUM_INTERACTIONS, GRADES, DIFFICULTY_LEVELS, LEARNING_STYLES, EMOTIONS,
)

random.seed(42)
np.random.seed(42)

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh",
    "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Saanvi", "Aanya",
    "Aadhya", "Isha", "Pari", "Myra", "Sara", "Navya", "Rohan", "Kabir",
    "Anika", "Meera", "Priya", "Rahul", "Neha", "Aryan", "Tanvi", "Dev",
    "Zara", "Riya", "Karan", "Nisha", "Varun", "Pooja", "Arnav", "Shreya",
    "Laksh", "Kiara", "Advait", "Mira", "Yash", "Tara", "Jai", "Sanya",
    "Om", "Ahana", "Rudra", "Kavya",
]


def _uid():
    return str(uuid.uuid4())


def generate_students(n: int = NUM_STUDENTS) -> pd.DataFrame:
    rows = []
    for _ in range(n):
        grade = random.choice(GRADES)
        num_interests = random.randint(2, 5)
        interests = random.sample(
            [s["name"] for s in SUBJECT_CATALOG], num_interests
        )
        strengths = random.sample(
            [s["name"] for s in SUBJECT_CATALOG], random.randint(1, 3)
        )
        weaknesses = random.sample(
            [s["name"] for s in SUBJECT_CATALOG if s["name"] not in strengths],
            random.randint(1, 2),
        )
        rows.append({
            "student_id": _uid(),
            "name": random.choice(FIRST_NAMES),
            "grade": grade,
            "interests": "|".join(interests),
            "strengths": "|".join(strengths),
            "weaknesses": "|".join(weaknesses),
            "learning_style": random.choice(LEARNING_STYLES),
            "onboarding_completed": True,
        })
    return pd.DataFrame(rows)


def generate_subjects() -> pd.DataFrame:
    rows = []
    for s in SUBJECT_CATALOG:
        rows.append({
            "subject_id": _uid(),
            "name": s["name"],
            "category": s["category"],
            "difficulty_level": random.choice(DIFFICULTY_LEVELS),
            "tags": "|".join(s["tags"]),
        })
    return pd.DataFrame(rows)


CHAPTER_TEMPLATES = {
    "Mathematics":      ["Number Systems", "Algebra Basics", "Linear Equations", "Quadratic Equations", "Geometry Fundamentals", "Coordinate Geometry", "Trigonometry", "Statistics & Probability", "Calculus Intro", "Matrices"],
    "Physics":          ["Motion & Kinematics", "Newton's Laws", "Work & Energy", "Gravitation", "Thermodynamics", "Waves & Sound", "Optics", "Electricity", "Magnetism", "Modern Physics"],
    "Chemistry":        ["Atomic Structure", "Periodic Table", "Chemical Bonding", "States of Matter", "Thermochemistry", "Equilibrium", "Acids & Bases", "Electrochemistry", "Organic Basics", "Polymers"],
    "Biology":          ["Cell Structure", "Cell Division", "Genetics & Heredity", "Evolution", "Plant Biology", "Human Anatomy", "Ecology", "Microbiology", "Biotechnology", "Reproduction"],
    "Computer Science": ["Intro to Programming", "Variables & Data Types", "Control Flow", "Functions", "Arrays & Lists", "Object-Oriented Programming", "Algorithms", "Data Structures", "Web Development", "Intro to AI"],
    "English":          ["Parts of Speech", "Sentence Structure", "Tenses", "Comprehension Skills", "Essay Writing", "Creative Writing", "Poetry Analysis", "Short Story", "Grammar Advanced", "Public Speaking"],
    "Hindi":            ["वर्णमाला", "संज्ञा-सर्वनाम", "क्रिया-विशेषण", "वाक्य रचना", "कविता", "कहानी लेखन", "निबंध", "पत्र लेखन", "समास-संधि", "मुहावरे"],
    "History":          ["Ancient Civilizations", "Medieval Period", "Renaissance", "Industrial Revolution", "World War I", "World War II", "Indian Freedom Movement", "Cold War", "Modern India", "Globalization"],
    "Geography":        ["Earth & Universe", "Landforms", "Climate & Weather", "Water Resources", "Map Skills", "Agriculture", "Industries", "Population", "Urbanization", "Natural Disasters"],
    "Economics":        ["Intro to Economics", "Supply & Demand", "Money & Banking", "Government Budget", "Inflation", "International Trade", "Development Economics", "Poverty", "Market Structures", "GDP & Growth"],
    "Political Science":["Democracy", "Indian Constitution", "Fundamental Rights", "Parliament", "Judiciary", "Local Government", "Political Parties", "Elections", "International Relations", "Public Policy"],
    "Art & Design":     ["Elements of Art", "Color Theory", "Sketching", "Perspective Drawing", "Painting Techniques", "Sculpture", "Digital Art Basics", "Graphic Design", "Art History", "Portfolio Building"],
    "Music":            ["Music Theory", "Rhythm & Beats", "Scales", "Indian Classical Basics", "Western Classical Basics", "Instruments", "Vocal Training", "Composition", "Music History", "Digital Music"],
    "Environmental Science": ["Ecosystems", "Biodiversity", "Pollution", "Climate Change", "Renewable Energy", "Water Conservation", "Waste Management", "Deforestation", "Sustainable Development", "Environmental Law"],
    "Psychology":       ["Intro to Psychology", "Perception & Sensation", "Memory & Learning", "Motivation", "Emotions", "Developmental Psychology", "Social Psychology", "Abnormal Psychology", "Cognitive Psychology", "Positive Psychology"],
}


def generate_chapters(subjects_df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, subj in subjects_df.iterrows():
        templates = CHAPTER_TEMPLATES.get(subj["name"], [f"Chapter {i+1}" for i in range(8)])
        n_chap = random.randint(*CHAPTERS_PER_SUBJECT)
        chosen = templates[:n_chap] if n_chap <= len(templates) else templates
        for idx, title in enumerate(chosen):
            difficulty = random.choices(
                DIFFICULTY_LEVELS, weights=[0.3, 0.45, 0.25]
            )[0]
            tags = random.sample(subj["tags"].split("|"), min(3, len(subj["tags"].split("|"))))
            rows.append({
                "chapter_id": _uid(),
                "subject_id": subj["subject_id"],
                "subject_name": subj["name"],
                "order_index": idx,
                "title": title,
                "difficulty": difficulty,
                "tags": "|".join(tags),
            })
    return pd.DataFrame(rows)


def generate_interactions(
    students_df: pd.DataFrame,
    chapters_df: pd.DataFrame,
    n: int = NUM_INTERACTIONS,
) -> pd.DataFrame:
    """
    Each interaction represents a student engaging with a chapter.
    Students who list a subject in their interests get a boost in score & rating.
    """
    student_ids = students_df["student_id"].tolist()
    chapter_rows = chapters_df[["chapter_id", "subject_name", "difficulty"]].to_dict("records")

    rows = []
    for _ in range(n):
        sid = random.choice(student_ids)
        student = students_df[students_df["student_id"] == sid].iloc[0]
        chap = random.choice(chapter_rows)

        is_interest = chap["subject_name"] in student["interests"].split("|")
        is_strength = chap["subject_name"] in student["strengths"].split("|")
        is_weakness = chap["subject_name"] in student["weaknesses"].split("|")

        base_score = np.random.normal(65, 15)
        if is_interest:
            base_score += np.random.uniform(5, 15)
        if is_strength:
            base_score += np.random.uniform(8, 18)
        if is_weakness:
            base_score -= np.random.uniform(5, 15)
        if chap["difficulty"] == "advanced":
            base_score -= np.random.uniform(3, 10)
        elif chap["difficulty"] == "beginner":
            base_score += np.random.uniform(3, 8)

        score = int(np.clip(base_score, 0, 100))
        rating = np.clip(round(score / 20 + np.random.normal(0, 0.3), 1), 1.0, 5.0)
        completion = np.clip(round(score / 100 + np.random.uniform(-0.1, 0.15), 2), 0.0, 1.0)
        time_minutes = int(np.clip(np.random.normal(45, 20), 5, 120))

        status = "completed" if completion >= 0.9 else ("in_progress" if completion > 0.2 else "not_started")
        engagement = np.clip(round(np.random.normal(0.6, 0.2), 2), 0.0, 1.0)

        rows.append({
            "interaction_id": _uid(),
            "student_id": sid,
            "chapter_id": chap["chapter_id"],
            "subject_name": chap["subject_name"],
            "score": score,
            "rating": rating,
            "completion_rate": completion,
            "time_spent_minutes": time_minutes,
            "status": status,
            "engagement_score": engagement,
        })
    return pd.DataFrame(rows)


def generate_sentiment(interactions_df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, inter in interactions_df.iterrows():
        n_logs = random.randint(1, 4)
        for _ in range(n_logs):
            if inter["engagement_score"] > 0.7:
                weights = [0.45, 0.05, 0.05, 0.02, 0.40, 0.03]
            elif inter["engagement_score"] < 0.3:
                weights = [0.05, 0.20, 0.30, 0.15, 0.05, 0.25]
            else:
                weights = [0.20, 0.15, 0.20, 0.10, 0.20, 0.15]

            emotion = random.choices(EMOTIONS, weights=weights)[0]
            confidence = round(np.random.uniform(0.5, 0.98), 2)
            rows.append({
                "student_id": inter["student_id"],
                "chapter_id": inter["chapter_id"],
                "emotion": emotion,
                "confidence": confidence,
            })
    return pd.DataFrame(rows)


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    print("Generating students …")
    students = generate_students()
    students.to_csv(DATA_DIR / "students.csv", index=False)
    print(f"  → {len(students)} students")

    print("Generating subjects …")
    subjects = generate_subjects()
    subjects.to_csv(DATA_DIR / "subjects.csv", index=False)
    print(f"  → {len(subjects)} subjects")

    print("Generating chapters …")
    chapters = generate_chapters(subjects)
    chapters.to_csv(DATA_DIR / "chapters.csv", index=False)
    print(f"  → {len(chapters)} chapters")

    print("Generating interactions …")
    interactions = generate_interactions(students, chapters)
    interactions.to_csv(DATA_DIR / "interactions.csv", index=False)
    print(f"  → {len(interactions)} interactions")

    print("Generating sentiment logs …")
    sentiment = generate_sentiment(interactions)
    sentiment.to_csv(DATA_DIR / "sentiment.csv", index=False)
    print(f"  → {len(sentiment)} sentiment logs")

    print(f"\nAll files saved to {DATA_DIR}/")


if __name__ == "__main__":
    main()
