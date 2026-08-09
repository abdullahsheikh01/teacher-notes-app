# Teacher Notes Agent

A responsive web app that helps teachers generate, organize, summarize, and plan lessons using AI agents (OpenAI Agents SDK).

## Architecture

- **Frontend:** Next.js (TypeScript, Tailwind CSS) — responsive UI with task cards + chat, streaming output, markdown editor, history
- **Backend:** FastAPI (Python) + OpenAI Agents SDK — skill-based agents with streaming, structured outputs, file parsing
- **Storage:** SQLite (history of saved notes)

## Prerequisites

- Node.js 18+
- Python 3.10+
- `OPENAI_API_KEY` (set in `backend/.env`)

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # add your OPENAI_API_KEY
uvicorn main:app --reload --port 8000
```

Run on a different port if 8000 is busy:

```bash
uvicorn main:app --reload --port 8001   # then point the frontend at it
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # serves on port 3000
```

To serve the frontend on another port:

```bash
npm run dev -- -p 3001
```

## Ports

Standard (default) ports — the frontend proxies `/api/*` to the backend:

| Service | Default port | Env var to override | Used by |
|---|---|---|---|
| Frontend (Next.js) | `3000` | `next dev -p <port>` | browser UI |
| Backend (FastAPI + Agents SDK) | `8000` | `BACKEND_URL` in `frontend/.env.local` | `/api/*` proxy |
| Storage (SQLite) | n/a (file) | `backend/notes.db` | history persistence |

The frontend reads the backend address from `BACKEND_URL` (defaults to `http://127.0.0.1:8000`). If you move the backend, update `frontend/.env.local`. If any default port is already in use, just pick any free port and set `BACKEND_URL` to match.

## Skills (Agents)

Each "skill" is an OpenAI Agent with its own instruction prompt:

| Skill | Agent | What it does |
|---|---|---|
| Generate notes | `generator` | Creates structured notes from subject/topic/grade |
| Organize notes | `organizer` | Restructures messy text/files into the standard format |
| Summarize | `summarizer` | Produces revision notes or simplifies language |
| Lesson plan | `lesson_planner` | Builds a full lesson plan + worksheet + answer key |
| Chat | `triage` | Routes free-form prompts to the right agent |

Skill prompts live in `backend/skills/*.md`.

## API Endpoints

- `POST /api/agents/generate` — stream notes generation
- `POST /api/agents/organize` — stream organize (supports file upload via multipart)
- `POST /api/agents/summarize` — stream summarize (supports file upload)
- `POST /api/agents/lesson-plan` — stream lesson plan
- `POST /api/chat` — free chat (triage agent)
- `GET/POST /api/notes` — list / save history
- `GET/DELETE /api/notes/{id}` — get / delete one note
- `GET /health` — backend health
