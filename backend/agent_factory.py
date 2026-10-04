import os
from functools import cache

from schemas import ChatRoute
from skill_loader import load_skill

MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
BASE_URL = os.getenv("LLM_BASE_URL") or None


@cache
def get_model():
    """Return the model for every agent, configured via LLM_* env vars.

    Without LLM_BASE_URL this is a plain model name served by OpenAI. With it,
    any OpenAI-compatible endpoint works: we hand agents a Chat Completions
    model object (most such providers don't implement Responses), which also
    stops the SDK from reading "cohere/..."-style names as provider prefixes.
    Traces can only be uploaded to OpenAI, so they're disabled in that case.
    """
    from agents import (
        OpenAIChatCompletionsModel,
        set_default_openai_client,
        set_tracing_disabled,
    )
    from openai import AsyncOpenAI

    client = AsyncOpenAI(base_url=BASE_URL, api_key=os.getenv("LLM_API_KEY"))
    if not BASE_URL:
        set_default_openai_client(client)
        return MODEL

    set_tracing_disabled(True)
    return OpenAIChatCompletionsModel(model=MODEL, openai_client=client)


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
- objectives: only for lesson-plan, any learning objectives the teacher gave.
- extra: anything else extra the teacher asked for.

If the task is "general", still try to fill topic/subject so a good answer can be
given. If details are missing, leave fields empty (do not invent them) - the
downstream agent will ask or proceed with what it has.
"""


def build_generator():
    from agents import Agent

    return Agent(
        name="notes_generator",
        instructions=load_skill("notes-generate"),
        model=get_model(),
    )


def build_organizer():
    from agents import Agent

    return Agent(
        name="notes_organizer",
        instructions=load_skill("notes-organize"),
        model=get_model(),
    )


def build_summarizer():
    from agents import Agent

    return Agent(
        name="notes_summarizer",
        instructions=load_skill("notes-summarize"),
        model=get_model(),
    )


def build_lesson_planner():
    from agents import Agent

    return Agent(
        name="lesson_planner",
        instructions=load_skill("lesson-plan"),
        model=get_model(),
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
        model=get_model(),
    )


def build_triage():
    from agents import Agent

    return Agent(
        name="triage",
        instructions=TRIAGE_INSTRUCTIONS,
        model=get_model(),
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