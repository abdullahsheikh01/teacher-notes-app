"use client";

import { useRef, useState } from "react";
import { streamFromBackend } from "@/lib/stream";
import { saveNote } from "@/lib/api";
import { titleFromMarkdown } from "@/lib/download";
import MarkdownBody from "@/components/MarkdownBody";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setError(null);
    setSaved(null);

    const history = messages.slice(-6);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setStreaming(true);

    abortRef.current = new AbortController();
    await streamFromBackend(
      "/api/chat",
      JSON.stringify({ message: text, history }),
      { "Content-Type": "application/json" },
      {
        onToken: (t) =>
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.role !== "assistant") return prev;
            return [...prev.slice(0, -1), { ...last, content: last.content + t }];
          }),
        onDone: () => setStreaming(false),
        onError: (m) => {
          setError(m);
          setStreaming(false);
        },
      },
      abortRef.current.signal
    );
  };

  const stop = () => abortRef.current?.abort();

  const saveLast = async () => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || !last.content.trim()) return;
    try {
      const savedNote = await saveNote({
        title: titleFromMarkdown(last.content),
        content: last.content,
        task: "chat",
      });
      setSaved(savedNote.id);
    } catch {
      setSaved(null);
    }
  };

  return (
    <div className="flex h-[480px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-sm text-zinc-400">
            Ask anything — e.g. <span className="italic">“Grade 6 science ke
            plants chapter ke notes banao”</span>
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="md-body md-body-compact">
                  <MarkdownBody content={m.content} />
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
              Agent working…
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            Saved to your notes{" "}
            <a href="/history" className="underline">
              (view)
            </a>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Type your request… (Enter to send)"
            className="flex-1 resize-none rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {streaming ? (
            <button
              onClick={stop}
              className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={send}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Send
            </button>
          )}
        </div>
        {messages.some((m) => m.role === "assistant" && m.content.trim()) && !streaming && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={saveLast}
              className="rounded-lg text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Save last answer to notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
