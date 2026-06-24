import type { Note } from "../types/note";
import { buildManuscriptTitle } from "./exportManuscript";

export const GUEST_STORAGE_KEY = "typewriter_guest_manuscripts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeGuestNote(value: unknown): Note | null {
  if (!isRecord(value) || typeof value.content !== "string") return null;

  const now = new Date().toISOString();
  const content = value.content;

  return {
    id: typeof value.id === "string" ? value.id : crypto.randomUUID(),
    title:
      typeof value.title === "string" && value.title.trim()
        ? value.title
        : buildManuscriptTitle(content),
    content,
    favorite: Boolean(value.favorite),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
    userId: typeof value.userId === "string" ? value.userId : "guest",
  };
}

export function readGuestNotes(): Note[] {
  const saved = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      return [];
    }

    const notes = parsed
      .map(normalizeGuestNote)
      .filter((note): note is Note => note !== null);

    if (notes.length !== parsed.length) {
      writeGuestNotes(notes);
    }

    return notes;
  } catch (error) {
    console.warn("Ignoring invalid guest manuscripts:", error);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    return [];
  }
}

export function writeGuestNotes(notes: Note[]): void {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(notes));
}

export function clearGuestNotes(): void {
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

export function hasGuestNotes(): boolean {
  return readGuestNotes().length > 0;
}
