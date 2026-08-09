"use client";

import { useRef, useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { Field, SelectField, SubmitButton, TextAreaField } from "@/components/fields";
import ResultPanel from "@/components/ResultPanel";
import { useAgentStream } from "@/lib/useAgentStream";

export default function SummarizePage() {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState("short");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { text, setText, streaming, done, error, start, stop } = useAgentStream();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (file) fd.append("file", file);
    if (content.trim()) fd.append("content", content);
    fd.append("mode", mode);
    await start("/api/agents/summarize", fd, {});
  };

  return (
    <PageShell
      icon="⚡"
      title="Summarize / Simplify"
      description="Turn long notes into compact revision notes, or rewrite them in simpler language."
    >
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Paste your notes (or upload a file below)
          </span>
          <TextAreaField
            rows={8}
            placeholder="Paste the notes you want summarized…"
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

        <Field label="Mode">
          <SelectField value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="short">Short revision notes</option>
            <option value="simple">Simplify the language</option>
          </SelectField>
        </Field>

        <div className="flex items-end">
          <SubmitButton disabled={streaming || (!file && !content.trim())}>
            Summarize
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
        task="summarize"
      />
    </PageShell>
  );
}
