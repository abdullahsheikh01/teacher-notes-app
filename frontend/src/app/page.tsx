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
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Teacher Notes Agent
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base dark:text-zinc-400">
          Generate, organize, and summarize class notes — or build complete lesson
          plans with worksheets — powered by AI agents.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Pick a task
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tasks.map((t) => (
            <TaskCard key={t.href} {...t} />
          ))}
        </div>
      </section>

      <section>
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
