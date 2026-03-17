"""
Central configuration for the LearnOS Recommendation Engine.
Paths, hyperparameters, and feature definitions live here so every
module imports a single source of truth.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data" / "synthetic"

# ── Synthetic data sizes ──────────────────────────────────────────
NUM_STUDENTS = 500
NUM_SUBJECTS = 15
CHAPTERS_PER_SUBJECT = (6, 14)  # min, max
NUM_INTERACTIONS = 8000

# ── Feature engineering ───────────────────────────────────────────
GRADES = ["K"] + [str(g) for g in range(1, 13)]

SUBJECT_CATALOG = [
    {"name": "Mathematics",     "category": "STEM",        "tags": ["algebra", "geometry", "calculus", "arithmetic", "statistics"]},
    {"name": "Physics",         "category": "STEM",        "tags": ["mechanics", "thermodynamics", "optics", "electricity", "waves"]},
    {"name": "Chemistry",       "category": "STEM",        "tags": ["organic", "inorganic", "physical", "biochemistry", "periodic-table"]},
    {"name": "Biology",         "category": "STEM",        "tags": ["genetics", "ecology", "anatomy", "cell-biology", "evolution"]},
    {"name": "Computer Science","category": "STEM",        "tags": ["programming", "algorithms", "data-structures", "web", "ai"]},
    {"name": "English",         "category": "Language",    "tags": ["grammar", "literature", "writing", "comprehension", "vocabulary"]},
    {"name": "Hindi",           "category": "Language",    "tags": ["grammar", "literature", "writing", "comprehension", "vocabulary"]},
    {"name": "History",         "category": "Humanities",  "tags": ["ancient", "medieval", "modern", "world-wars", "civilizations"]},
    {"name": "Geography",       "category": "Humanities",  "tags": ["physical", "human", "climate", "maps", "resources"]},
    {"name": "Economics",       "category": "Humanities",  "tags": ["micro", "macro", "finance", "markets", "development"]},
    {"name": "Political Science","category":"Humanities",  "tags": ["democracy", "governance", "constitution", "international", "policy"]},
    {"name": "Art & Design",    "category": "Creative",    "tags": ["drawing", "painting", "sculpture", "digital-art", "design"]},
    {"name": "Music",           "category": "Creative",    "tags": ["theory", "instruments", "vocals", "composition", "history"]},
    {"name": "Environmental Science","category":"STEM",    "tags": ["ecology", "sustainability", "pollution", "conservation", "climate"]},
    {"name": "Psychology",      "category": "Humanities",  "tags": ["cognitive", "behavioral", "developmental", "social", "neuroscience"]},
]

DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"]
LEARNING_STYLES = ["visual", "auditory", "reading", "kinesthetic"]
EMOTIONS = ["engaged", "confused", "bored", "frustrated", "happy", "drowsy"]

# ── Model hyper-parameters ────────────────────────────────────────
CONTENT_TFIDF_MAX_FEATURES = 300
SVD_N_COMPONENTS = 30
NMF_N_COMPONENTS = 30
HYBRID_CONTENT_WEIGHT = 0.4
HYBRID_COLLAB_WEIGHT = 0.6
TOP_K_RECOMMENDATIONS = 10
