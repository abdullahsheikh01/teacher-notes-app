import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teacher Notes Agent",
  description: "Generate, organize, and summarize class notes with AI agents.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tasks/generate", label: "Generate" },
  { href: "/tasks/organize", label: "Organize" },
  { href: "/tasks/summarize", label: "Summarize" },
  { href: "/tasks/lesson-plan", label: "Lesson Plan" },
  { href: "/history", label: "History" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <Link href="/" className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              ✏️ NotesAgent
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-2.5 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          Teacher Notes Agent · Next.js + FastAPI + OpenAI Agents SDK
        </footer>
      </body>
    </html>
  );
}
