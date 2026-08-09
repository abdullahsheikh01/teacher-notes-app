import {
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

const base =
  "w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/40";

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={base} />;
}

export function TextAreaField(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} resize-y`} />;
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={base} />;
}

export function SubmitButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
