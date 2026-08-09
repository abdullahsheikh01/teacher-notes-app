import type { ReactNode } from "react";

export default function PageShell({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/10">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
