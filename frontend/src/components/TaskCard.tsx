import Link from "next/link";

export type TaskCardProps = {
  href: string;
  title: string;
  description: string;
  icon: string;
  accent?: string;
};

export default function TaskCard({ href, title, description, icon, accent = "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" }: TaskCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}
      >
        {icon}
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        <span className="text-sm leading-snug text-zinc-500 dark:text-zinc-400">{description}</span>
        <span className="mt-1 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
          Open →
        </span>
      </span>
    </Link>
  );
}
