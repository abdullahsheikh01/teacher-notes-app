"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import { deleteNote, listNotes, type SavedNote } from "@/lib/api";
import { downloadDocx, downloadMarkdown, titleFromMarkdown } from "@/lib/download";
import MarkdownBody from "@/components/MarkdownBody";

export default function HistoryPage() {
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listNotes()
      .then((data) => {
        if (!cancelled) setNotes(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load notes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setExpanded((cur) => (cur === id ? null : cur));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const taskLabels: Record<string, string> = {
    generate: "Generated",
    organize: "Organized",
    summarize: "Summarized",
    "lesson-plan": "Lesson Plan",
    chat: "Chat",
  };

  return (
    <PageShell
      icon="📚"
      title="Saved Notes"
      description="Your saved notes and lesson plans. Click one to view, download, or delete."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && <p className="py-10 text-center text-sm text-zinc-400">Loading…</p>}

      {!loading && notes.length === 0 && (
        <p className="py-16 text-center text-sm text-zinc-400">
          No saved notes yet. Generate something and hit {"\u201CSave to notes\u201D"}.
        </p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              onClick={() => setExpanded(expanded === note.id ? null : note.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {note.title}
                </span>
                <span className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {taskLabels[note.task] ?? note.task}
                  </span>
                  {note.subject && <span>{note.subject}</span>}
                  {note.topic && <span>· {note.topic}</span>}
                  {note.grade && <span>· {note.grade}</span>}
                </span>
              </span>
              <span className="shrink-0 text-xs text-zinc-400">
                {new Date(note.created_at).toLocaleDateString()}
                <span className="ml-2 inline-block text-zinc-300 dark:text-zinc-600">
                  {expanded === note.id ? "▲" : "▼"}
                </span>
              </span>
            </button>

            {expanded === note.id && (
              <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
                <div className="max-h-[420px] overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <MarkdownBody content={note.content} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => downloadMarkdown(note.content, `${titleFromMarkdown(note.content, "notes").toLowerCase().replace(/\s+/g, "-")}.md`)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    .md
                  </button>
                  <button
                    onClick={() => downloadDocx(note.content, `${titleFromMarkdown(note.content, "notes").toLowerCase().replace(/\s+/g, "-")}.docx`)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    .docx
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="ml-auto rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
