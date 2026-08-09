"use client";

import { useRef, useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { Field, SubmitButton, TextAreaField, TextField } from "@/components/fields";
import ResultPanel from "@/components/ResultPanel";
import { useAgentStream } from "@/lib/useAgentStream";

export default function OrganizePage() {
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { text, setText, streaming, done, error, start, stop } = useAgentStream();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (file) fd.append("file", file);
    if (content.trim()) fd.append("content", content);
    fd.append("subject", subject);
    fd.append("grade", grade);
    await start("/api/agents/organize", fd, {});
  };

  return (
    <PageShell
      icon="🧹"
      title="Organize Notes"
      description="Paste messy notes or upload a file — the agent will restructure them into a clean, standard format."
    >
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Paste your notes (or upload a file below)
          </span>
          <TextAreaField
            rows={8}
            placeholder="Paste your rough notes here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Or upload a file</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown,.docx,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100 dark:text-zinc-400 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
          />
          {file && <span className="text-xs text-zinc-500">Selected: {file.name}</span>}
        </div>

        <Field label="Subject (optional)">
          <TextField placeholder="e.g. Physics — or leave empty" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Grade (optional)">
          <TextField placeholder="e.g. Grade 8" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </Field>

        <div className="sm:col-span-2">
          <SubmitButton disabled={streaming || (!file && !content.trim())}>
            Organize Notes
          </SubmitButton>
        </div>
      </form>

      <ResultPanel
        text={text}
        onChange={setText}
        streaming={streaming}
        done={done}
        error={error}
        onStop={stop}
        task="organize"
        meta={{ subject, topic: "", grade }}
      />
    </PageShell>
  );
}
