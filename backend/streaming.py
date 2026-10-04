import json
from collections.abc import AsyncIterator

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from agents import Agent


def sse(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def build_prompt(user_text: str, extra_instructions: str | None = None) -> str:
    if extra_instructions:
        return f"{user_text}\n\nAdditional teacher instructions:\n{extra_instructions}"
    return user_text


async def agent_stream(
    agent: object, prompt: str, history: list | None = None
) -> AsyncIterator[str]:
    """Run an agent with streaming and yield SSE-encoded events.

    ``history`` (earlier chat messages) is sent ahead of ``prompt`` so the
    agent can follow up on the conversation instead of starting fresh.

    Imports the OpenAI Agents SDK lazily so the FastAPI app starts quickly
    and only agent calls pay the (heavy) SDK import cost.
    """
    from agents import Runner

    try:
        if history:
            messages = [{"role": m.role, "content": m.content} for m in history]
            result = Runner.run_streamed(
                agent, messages + [{"role": "user", "content": prompt}]
            )
        else:
            result = Runner.run_streamed(agent, prompt)
    except Exception as exc:  # noqa: BLE001
        yield sse({"type": "error", "message": f"Failed to start agent: {exc}"})
        return

    try:
        async for event in result.stream_events():
            if event.type == "raw_response_event":
                data = event.data
                if getattr(data, "type", "") == "response.output_text.delta":
                    yield sse({"type": "token", "text": data.delta})
        output = result.final_output
        yield sse({"type": "done", "output": output or ""})
    except Exception as exc:  # noqa: BLE001
        yield sse({"type": "error", "message": f"Agent run failed: {exc}"})