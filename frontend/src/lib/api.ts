export type SavedNote = {
  id: number;
  title: string;
  content: string;
  task: string;
  subject: string;
  topic: string;
  grade: string;
  created_at: string;
};

export async function listNotes(): Promise<SavedNote[]> {
  const res = await fetch("/api/notes", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load notes (${res.status})`);
  return res.json();
}

export async function saveNote(payload: {
  title: string;
  content: string;
  task: string;
  subject?: string;
  topic?: string;
  grade?: string;
}): Promise<SavedNote> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save note (${res.status})`);
  return res.json();
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete note (${res.status})`);
}
