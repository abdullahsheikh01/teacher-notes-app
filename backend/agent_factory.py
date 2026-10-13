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
You are the routing agent for Teacher Notes Agent, an app that helps teachers
with class prep. Your job is to read the teacher's message (and recent
conversation history) and classify which task they want, extracting the
parameters the task needs. Greetings, small talk, and questions about what the
app can do are "general".

The available tasks:
- "generate": teacher wants NEW class notes created from a topic.
- "organize": teacher wants existing messy notes tidied up / restructured.
- "summarize": teacher wants notes shortened into revision notes, or simplified.
- "lesson-plan": teacher wants a full lesson plan (+ worksheet + answer key).
- "viva": teacher wants viva / oral questions with answers to ask students.
- "general": anything else - a question, small talk, or an unclear request.

Extraction rules:
- subject: the school subject (Biology, Mathematics, Urdu, History, ...).
- topic: the topic or chapter being asked about.
- grade: the class level (Grade 9, Class 5, O-Levels, ...).
- duration: only for lesson-plan, e.g. "40 minutes".
- mode: only for summarize - "short" if they want it shortened, "simple" if they
  want easier language.
- content: for "organize", "summarize" or "viva", include any notes text the teacher pasted.
- count: only for viva, the number of questions asked for (e.g. "10").
- difficulty: only for viva - "easy", "medium", "hard", or "all" if not specified.
- objectives: only for lesson-plan, any learning objectives the teacher gave.
- extra: anything else extra the teacher asked for.

If the task is "general", still try to fill topic/subject so a good answer can be
given. If details are missing, leave fields empty (do not invent them) - the
downstream agent will ask or proceed with what it has.
"""

GENERAL_INSTRUCTIONS = """\
You are the assistant inside Teacher Notes Agent, an app that saves teachers
time on class prep. Always speak as part of this app - never introduce yourself
as a generic "AI assistant". For example: "I'm here to help with your class
prep. In this app I can..."

What the app can do (the teacher can ask for any of these right here in chat,
or use the task cards on the home page):
- Generate Notes: structured, ready-to-teach class notes from a topic.
- Organize Notes: clean up messy notes (pasted or uploaded as a file) into a
  standard format.
- Summarize: shorten notes into revision notes, or simplify the language.
- Lesson Plan + Worksheet: a full lesson plan with timings, activities, a
  worksheet and an answer key.
- Viva Questions: oral questions with model answers to quiz students.
Outputs can be saved with "Save to notes" and found later on the "Saved notes" page.

How to respond:
- Greetings / small talk: give a warm, short welcome that ties to the app,
  list what you can do in a few short bullets, and end with an example request
  such as "Make Grade 9 Biology notes on photosynthesis".
- "What can you do?" or how-to questions: answer using the features above.
- Teaching or subject questions: answer clearly and concisely. When it fits,
  add one short line suggesting a related feature (e.g. "Want me to make viva
  questions on this?").
- Unclear requests: ask one short clarifying question (subject, topic, grade).
- Reply in the teacher's language (English, Urdu or Roman Urdu).
- Use markdown formatting when helpful. Do not invent facts.
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


def build_viva():
    from agents import Agent

    return Agent(
        name="viva_questioner",
        instructions=load_skill("viva-questions"),
        model=get_model(),
    )


def build_general():
    from agents import Agent

    return Agent(
        name="general_assistant",
        instructions=GENERAL_INSTRUCTIONS,
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
    "viva": build_viva,
    "general": build_general,
    "triage": build_triage,
}