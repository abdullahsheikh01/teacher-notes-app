import os
from typing import Annotated

import dotenv
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

dotenv.load_dotenv()

import agent_factory
from db import Note, get_session
from file_parser import parse_file
from schemas import (
    ChatRequest,
    ChatRoute,
    GenerateRequest,
    LessonPlanRequest,
    NoteIn,
    NoteOut,
)
from streaming import agent_stream, build_prompt, sse

app = FastAPI(title="Teacher Notes Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/agents/generate")
async def generate_notes(req: GenerateRequest):
    agent = agent_factory.build_generator()
    prompt = build_prompt(
        (
            f"Subject: {req.subject}\n"
            f"Topic: {req.topic}\n"
            f"Grade: {req.grade}"
        ),
        req.extra,
    )
    return StreamingResponse(agent_stream(agent, prompt), media_type="text/event-stream")


@app.post("/api/agents/lesson-plan")
async def lesson_plan(req: LessonPlanRequest):
    agent = agent_factory.build_lesson_planner()
    extra = f"\nObjectives: {req.objectives}" if req.objectives else ""
    prompt = build_prompt(
        (
            f"Subject: {req.subject}\n"
            f"Topic: {req.topic}\n"
            f"Grade: {req.grade}\n"
            f"Duration: {req.duration}"
            f"{extra}"
        ),
        req.extra,
    )
    return StreamingResponse(agent_stream(agent, prompt), media_type="text/event-stream")


@app.post("/api/agents/organize")
async def organize_notes(
    content: Annotated[str | None, Form()] = None,
    subject: Annotated[str, Form()] = "",
    grade: Annotated[str, Form()] = "",
    file: Annotated[UploadFile | None, File()] = None,
):
    try:
        text = await _resolve_content(content, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    agent = agent_factory.build_organizer()
    prompt = build_prompt(
        f"Content to organize:\n{text}\n\nSubject: {subject or '(infer from content)'}\nGrade: {grade or '(infer from content)'}"
    )
    return StreamingResponse(agent_stream(agent, prompt), media_type="text/event-stream")


@app.post("/api/agents/summarize")
async def summarize_notes(
    content: Annotated[str | None, Form()] = None,
    mode: Annotated[str, Form()] = "short",
    file: Annotated[UploadFile | None, File()] = None,
):
    if mode not in ("short", "simple"):
        mode = "short"
    try:
        text = await _resolve_content(content, file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    agent = agent_factory.build_summarizer()
    prompt = build_prompt(f"Mode: {mode}\n\nContent:\n{text}")
    return StreamingResponse(agent_stream(agent, prompt), media_type="text/event-stream")


@app.post("/api/chat")
async def chat(req: ChatRequest):
    route = await _route_message(req)

    if route.task == "general":
        agent = agent_factory.build_general()
        prompt = build_prompt(req.message, route.reasoning)
    else:
        agent = agent_factory.AGENTS[route.task]()
        prompt = _prompt_for_route(route)
    return StreamingResponse(agent_stream(agent, prompt), media_type="text/event-stream")


# ---- history ----

@app.get("/api/notes", response_model=list[NoteOut])
async def list_notes(session: Session = Depends(get_session)):
    notes = session.exec(select(Note).order_by(Note.id.desc())).all()
    return [_to_out(n) for n in notes]


@app.post("/api/notes", response_model=NoteOut, status_code=201)
async def save_note(payload: NoteIn, session: Session = Depends(get_session)):
    note = Note(**payload.model_dump())
    session.add(note)
    session.commit()
    session.refresh(note)
    return _to_out(note)


@app.get("/api/notes/{note_id}", response_model=NoteOut)
async def get_note(note_id: int, session: Session = Depends(get_session)):
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return _to_out(note)


@app.delete("/api/notes/{note_id}", status_code=204)
async def delete_note(note_id: int, session: Session = Depends(get_session)):
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    session.delete(note)
    session.commit()
    return None


# ---- helpers ----


async def _resolve_content(content: str | None, file: UploadFile | None) -> str:
    if file is not None and file.filename:
        raw = await file.read()
        if raw:
            return parse_file(file.filename, raw)
    if content:
        return content
    raise ValueError("Provide either text content or upload a file.")


async def _route_message(req: ChatRequest) -> ChatRoute:
    from agents import Runner

    triage = agent_factory.build_triage()
    history = "".join(f"{m.role}: {m.content}\n" for m in req.history[-6:])
    prompt = f"Conversation history:\n{history}\nLatest message: {req.message}"
    result = await Runner.run(triage, prompt)
    return result.final_output


def _prompt_for_route(route: ChatRoute) -> str:
    if route.task == "generate":
        return build_prompt(
            f"Subject: {route.subject}\nTopic: {route.topic}\nGrade: {route.grade}",
            route.extra,
        )
    if route.task == "lesson-plan":
        extra = f"\nObjectives: {route.objectives}" if route.objectives else ""
        return build_prompt(
            f"Subject: {route.subject}\nTopic: {route.topic}\nGrade: {route.grade}\n"
            f"Duration: {route.duration or '45 minutes'}{extra}",
            route.extra,
        )
    if route.task == "organize":
        return build_prompt(
            f"Content to organize:\n{route.content}\n\nSubject: {route.subject or '(infer)'}\nGrade: {route.grade or '(infer)'}"
        )
    if route.task == "summarize":
        return build_prompt(f"Mode: {route.mode}\n\nContent:\n{route.content}")
    return build_prompt(route.content or "")


def _to_out(note: Note) -> NoteOut:
    return NoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        task=note.task,
        subject=note.subject,
        topic=note.topic,
        grade=note.grade,
        created_at=note.created_at,
    )
