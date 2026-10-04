"use client";

import { useState } from "react";
import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import ChatBox from "@/components/ChatBox";

const tasks = [
  {
    href: "/tasks/generate",
    icon: "📝",
    title: "Generate Notes",
    description: "Turn a topic into structured, ready-to-teach class notes.",
  },
  {
    href: "/tasks/organize",
    icon: "🧹",
    title: "Organize Notes",
    description: "Paste messy notes or upload a file to get a clean standard format.",
  },
  {
    href: "/tasks/summarize",
    icon: "⚡",
    title: "Summarize",
    description: "Compress long notes into revision notes or simplify the language.",
  },
  {
    href: "/tasks/lesson-plan",
    icon: "🗓️",
    title: "Lesson Plan + Worksheet",
    description: "A complete lesson plan with timetable, activities, and answer key.",
  },
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <section className="relative mb-10 text-center">
        <div className="mb-4 flex justify-end sm:absolute sm:right-0 sm:top-1 sm:mb-0">
          <button
            type="button"
            onClick={() => setChatOpen((o) => !o)}
            className={`${chatOpen ? "" : "cursor-pointer "}rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600`}
          >
            {chatOpen ? "← Back to tasks" : "💬 Just Ask"}
          </button>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Teacher Notes Agent
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
          Generate, organize, and summarize class notes — or build complete lesson
          plans with worksheets — powered by AI agents.
        </p>
      </section>

      <section className={chatOpen ? "hidden" : "mb-10"}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Pick a task
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tasks.map((t) => (
            <TaskCard key={t.href} {...t} />
          ))}
        </div>
      </section>

      {/* Kept mounted while hidden so the conversation survives toggling. */}
      <section className={chatOpen ? "" : "hidden"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Just ask
          </h2>
          <Link href="/history" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Saved notes →
          </Link>
        </div>
        <ChatBox />
      </section>
    </div>
  );
}
