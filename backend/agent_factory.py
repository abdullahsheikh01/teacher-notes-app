import os

from schemas import ChatRoute
from skill_loader import load_skill

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

TRIAGE_INSTRUCTIONS = """\
You are the routing agent for a teacher's note-taking assistant. Your job is to
read the teacher's message (and recent conversation history) and classify which
task they want, extracting the parameters the task needs.

The available tasks:
- "generate": teacher wants NEW class notes created from a topic.
- "organize": teacher wants existing messy notes tidied up / restructured.
- "summarize": teacher wants notes shortened into revision notes, or simplified.
- "lesson-plan": teacher wants a full lesson plan (+ worksheet + answer key).
- "general": anything else - a question, small talk, or an unclear request.

Extraction rules:
- subject: the school subject (Biology, Mathematics, Urdu, History, ...).
- topic: the topic or chapter being asked about.
- grade: the class level (Grade 9, Class 5, O-Levels, ...).
- duration: only for lesson-plan, e.g. "40 minutes".
- mode: only for summarize - "short" if they want it shortened, "simple" if they
  want easier language.
- content: for "organize" or "summarize", include any notes text the teacher pasted.
- objectives/extra: capture anything extra the teacher asked for.

If the task is "general", still try to fill topic/subject so a good answer can be
given. If details are missing, leave fields empty (do not invent them) - the
downstream agent will ask or proceed with what it has.
"""


def build_generator():
    from agents import Agent

    return Agent(
        name="notes_generator",
        instructions=load_skill("notes-generate"),
        model=MODEL,
    )


def build_organizer():
    from agents import Agent

    return Agent(
        name="notes_organizer",
        instructions=load_skill("notes-organize"),
        model=MODEL,
    )


def build_summarizer():
    from agents import Agent

    return Agent(
        name="notes_summarizer",
        instructions=load_skill("notes-summarize"),
        model=MODEL,
    )


def build_lesson_planner():
    from agents import Agent

    return Agent(
        name="lesson_planner",
        instructions=load_skill("lesson-plan"),
        model=MODEL,
    )


def build_general():
    from agents import Agent

    return Agent(
        name="general_assistant",
        instructions=(
            "You are a friendly, expert teaching assistant. Answer the teacher's "
            "question clearly and concisely. Use markdown formatting when helpful. "
            "Do not invent facts."
        ),
        model=MODEL,
    )


def build_triage():
    from agents import Agent

    return Agent(
        name="triage",
        instructions=TRIAGE_INSTRUCTIONS,
        model=MODEL,
        output_type=ChatRoute,
    )


AGENTS = {
    "generate": build_generator,
    "organize": build_organizer,
    "summarize": build_summarizer,
    "lesson-plan": build_lesson_planner,
    "general": build_general,
    "triage": build_triage,
}