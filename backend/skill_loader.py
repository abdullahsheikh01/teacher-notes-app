from pathlib import Path

SKILLS_DIR = Path(__file__).resolve().parent / "skills"


def load_skill(name: str) -> str:
    path = SKILLS_DIR / f"{name}.md"
    return path.read_text(encoding="utf-8")
