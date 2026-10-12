"use client";

import { useRef, useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { Field, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/fields";
import ResultPanel from "@/components/ResultPanel";
import { useAgentStream } from "@/lib/useAgentStream";

export default function VivaPage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [count, setCount] = useState("15");
  const [difficulty, setDifficulty] = useState("all");
  const [content, setContent] = useState("");
  const [extra, setExtra] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { text, setText, streaming, done, error, start, stop } = useAgentStream();

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("subject", subject);
    fd.append("topic", topic);
    fd.append("grade", grade);
    fd.append("count", count);
    fd.append("difficulty", difficulty);
    fd.append("extra", extra);
    if (file) fd.append("file", file);
    else if (content.trim()) fd.append("content", content);
    await start("/api/agents/viva", fd, {});
  };

  return (
    <PageShell
      icon="🎤"
      title="Viva Questions"
      description="Get oral questions with model answers to ask your students — from a topic or from your own lesson notes."
    >
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
        <Field label="Subject">
          <TextField required placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Grade">
          <SelectField value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">Select grade…</option>
            {["Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "O-Levels", "A-Levels"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </SelectField>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Topic">
            <TextField required placeholder="e.g. Photosynthesis" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </Field>
        </div>
        <Field label="Number of questions">
          <SelectField value={count} onChange={(e) => setCount(e.target.value)}>
            {["10", "15", "20", "25"].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="Difficulty">
          <SelectField value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="all">All types (Easy + Medium + Hard)</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </SelectField>
        </Field>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Lesson notes (optional — paste here or upload a file below)
          </span>
          <TextAreaField
            rows={5}
            placeholder={file ? "A file is selected — only the file will be used." : "Paste the lesson you taught so questions come from it…"}
            value={content}
            disabled={!!file}
            title={file ? "Remove the file to type or paste notes instead" : undefined}
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
          {file && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-zinc-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-zinc-300">
              <span className="min-w-0 flex-1 break-all">
                📎 <strong>{file.name}</strong> — the text box above will be ignored.
              </span>
              <button
                type="button"
                onClick={clearFile}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                ✕ Remove file
              </button>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Field label="Extra instructions (optional)">
            <TextField placeholder="e.g. focus on diagrams-related questions" value={extra} onChange={(e) => setExtra(e.target.value)} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <SubmitButton disabled={streaming}>Get Viva Questions</SubmitButton>
        </div>
      </form>

      <ResultPanel
        text={text}
        onChange={setText}
        streaming={streaming}
        done={done}
        error={error}
        onStop={stop}
        task="viva"
        meta={{ subject, topic, grade }}
      />
    </PageShell>
  );
}
