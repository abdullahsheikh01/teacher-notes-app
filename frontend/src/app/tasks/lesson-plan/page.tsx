"use client";

import { useState, type FormEvent } from "react";
import PageShell from "@/components/PageShell";
import { Field, SelectField, SubmitButton, TextAreaField, TextField } from "@/components/fields";
import ResultPanel from "@/components/ResultPanel";
import { useAgentStream } from "@/lib/useAgentStream";

export default function LessonPlanPage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [duration, setDuration] = useState("45 minutes");
  const [objectives, setObjectives] = useState("");
  const [extra, setExtra] = useState("");
  const { text, setText, streaming, done, error, start, stop } = useAgentStream();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await start(
      "/api/agents/lesson-plan",
      JSON.stringify({ subject, topic, grade, duration, objectives, extra }),
      { "Content-Type": "application/json" }
    );
  };

  return (
    <PageShell
      icon="🗓️"
      title="Lesson Plan + Worksheet"
      description="Build a complete lesson plan with a timetable, activities, worksheet, and answer key."
    >
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-900">
        <Field label="Subject">
          <TextField required placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
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
          <TextField required placeholder="e.g. Quadratic Equations" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <Field label="Duration">
          <SelectField value={duration} onChange={(e) => setDuration(e.target.value)}>
            {["30 minutes", "40 minutes", "45 minutes", "60 minutes", "80 minutes", "90 minutes"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="Learning objectives (optional)">
          <TextAreaField
            rows={2}
            placeholder="e.g. Students will solve quadratic equations using the formula"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </Field>
        <Field label="Extra instructions (optional)">
          <TextField placeholder="e.g. include a group activity" value={extra} onChange={(e) => setExtra(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <SubmitButton disabled={streaming}>Build Lesson Plan</SubmitButton>
        </div>
      </form>

      <ResultPanel
        text={text}
        onChange={setText}
        streaming={streaming}
        done={done}
        error={error}
        onStop={stop}
        task="lesson-plan"
        meta={{ subject, topic, grade }}
      />
    </PageShell>
  );
}
