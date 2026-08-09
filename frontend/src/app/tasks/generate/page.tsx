"use client";

import { useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { Field, SelectField, SubmitButton, TextField } from "@/components/fields";
import ResultPanel from "@/components/ResultPanel";
import { useAgentStream } from "@/lib/useAgentStream";

export default function GeneratePage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [extra, setExtra] = useState("");
  const { text, setText, streaming, done, error, start, stop } = useAgentStream();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await start(
      "/api/agents/generate",
      JSON.stringify({ subject, topic, grade, extra }),
      { "Content-Type": "application/json" }
    );
  };

  return (
    <PageShell
      icon="📝"
      title="Generate Notes"
      description="Create structured class notes from a topic, subject, and grade."
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
        <Field label="Topic">
          <TextField required placeholder="e.g. Photosynthesis" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <Field label="Extra instructions (optional)">
          <TextField placeholder="e.g. focus on experiments" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <SubmitButton disabled={streaming}>Generate Notes</SubmitButton>
        </div>
      </form>

      <ResultPanel
        text={text}
        onChange={setText}
        streaming={streaming}
        done={done}
        error={error}
        onStop={stop}
        task="generate"
        meta={{ subject, topic, grade }}
      />
    </PageShell>
  );
}
