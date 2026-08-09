"use client";

import { useState } from "react";
import { downloadDocx, downloadMarkdown, titleFromMarkdown } from "@/lib/download";
import { saveNote } from "@/lib/api";
import MarkdownBody from "@/components/MarkdownBody";

export type ResultPanelProps = {
  text: string;
  onChange: (value: string) => void;
  streaming: boolean;
  done: boolean;
  error: string | null;
  onStop: () => void;
  task: string;
  meta?: { subject?: string; topic?: string; grade?: string };
};

export default function ResultPanel({
  text,
  onChange,
  streaming,
  done,
  error,
  onStop,
  task,
  meta,
}: ResultPanelProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasText = text.trim().length > 0;

  const handleSave = async () => {
    if (!hasText) return;
    setSaving(true);
    setSaved(false);
    try {
      await saveNote({
        title: titleFromMarkdown(text),
        content: text,
        task,
        subject: meta?.subject,
        topic: meta?.topic,
        grade: meta?.grade,
      });
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {streaming && (
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            Generating…
          </span>
          <button
            onClick={onStop}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Stop
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {!hasText && !streaming && (
        <p className="py-6 text-center text-sm text-zinc-400">
          Your result will appear here…
        </p>
      )}

      {hasText && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
              {(["preview", "edit"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition ${
                    mode === m
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {done && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save to notes"}
                </button>
              )}
              <button
                onClick={() => downloadMarkdown(text, `${titleFromMarkdown(text, "notes").toLowerCase().replace(/\s+/g, "-")}.md`)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                .md
              </button>
              <button
                onClick={() => downloadDocx(text, `${titleFromMarkdown(text, "notes").toLowerCase().replace(/\s+/g, "-")}.docx`)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                .docx
              </button>
            </div>
          </div>

          {mode === "preview" ? (
            <MarkdownBody content={text} />
          ) : (
            <textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="h-96 w-full resize-y rounded-lg border border-zinc-300 bg-zinc-50 p-3 font-mono text-sm text-zinc-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          )}
        </>
      )}
    </div>
  );
}
