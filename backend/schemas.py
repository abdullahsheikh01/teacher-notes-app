from typing import Literal

from pydantic import BaseModel, field_validator


class GenerateRequest(BaseModel):
    subject: str
    topic: str
    grade: str
    extra: str = ""


class LessonPlanRequest(BaseModel):
    subject: str
    topic: str
    grade: str
    duration: str = "45 minutes"
    objectives: str = ""
    extra: str = ""


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatRoute(BaseModel):
    task: Literal["generate", "organize", "summarize", "lesson-plan", "general"]
    subject: str = ""
    topic: str = ""
    grade: str = ""
    duration: str = ""
    mode: Literal["short", "simple"] = "short"
    content: str = ""
    objectives: str = ""
    extra: str = ""
    reasoning: str = ""

    @field_validator("mode", mode="before")
    @classmethod
    def _default_mode(cls, value: object) -> object:
        # Weaker models often send "" or other junk for this optional field.
        return value if value in ("short", "simple") else "short"


class NoteIn(BaseModel):
    title: str
    content: str
    task: str = "generate"
    subject: str = ""
    topic: str = ""
    grade: str = ""


class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    task: str
    subject: str
    topic: str
    grade: str
    created_at: str
