import { useState, useEffect, useCallback, useRef } from "react";
import type { Note } from "../types/note";
import api from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import { buildManuscriptTitle } from "../utils/exportManuscript";
import { readGuestNotes, writeGuestNotes } from "../utils/guestNotesStorage";

export type SaveState = "idle" | "saving" | "saved" | "offline" | "error";

interface SaveNoteInput {
  id?: string | null;
  title: string;
  content: string;
  favorite?: boolean;
}

function normalizeNote(note: Note): Note {
  return {
    ...note,
    favorite: Boolean(note.favorite),
  };
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;

    return (
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
    );
  });
}

export function useNotes() {
  const { user, isGuest } = useAuth();
  const [archive, setArchive] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const archiveRef = useRef<Note[]>([]);
  const statusTimeoutRef = useRef<number | null>(null);
  const saveSequenceRef = useRef(0);

  const scheduleSaveStateReset = useCallback((delay: number) => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
    }

    statusTimeoutRef.current = window.setTimeout(() => {
      setSaveState("idle");
      statusTimeoutRef.current = null;
    }, delay);
  }, []);

  useEffect(() => {
    archiveRef.current = archive;
  }, [archive]);

  const persistGuestArchive = useCallback((notes: Note[]) => {
    const sortedNotes = sortNotes(notes.map(normalizeNote));
    setArchive(sortedNotes);
    archiveRef.current = sortedNotes;
    writeGuestNotes(sortedNotes);
    return sortedNotes;
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        window.clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Notizen laden: Unterscheidung zwischen Cloud und Lokal
  useEffect(() => {
    let cancelled = false;

    const loadArchive = async () => {
      // Defer state updates so the effect does not cause a synchronous render cascade.
      await Promise.resolve();
      if (cancelled) return;

      setLoading(true);

      if (isGuest) {
        if (!cancelled) {
          const guestNotes = sortNotes(readGuestNotes().map(normalizeNote));
          archiveRef.current = guestNotes;
          setArchive(guestNotes);
          setLoading(false);
        }
        return;
      }

      if (user) {
        try {
          const response = await api.get("/notes");
          if (!cancelled) {
            const notes =
              Array.isArray(response.data)
                ? sortNotes(response.data.map(normalizeNote))
                : [];
            archiveRef.current = notes;
            setArchive(notes);
          }
        } catch {
          if (!cancelled) setArchive([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      setArchive([]);
      setLoading(false);
    };

    void loadArchive();
    return () => {
      cancelled = true;
    };
  }, [user, isGuest]);

  const saveNote = useCallback(
    async ({ id, title, content, favorite }: SaveNoteInput) => {
      if (!content.trim()) return null;
      const saveSequence = saveSequenceRef.current + 1;
      saveSequenceRef.current = saveSequence;
      setSaving(true);
      setSaveState("saving");

      if (isGuest) {
        const now = new Date().toISOString();
        const currentArchive = archiveRef.current;
        const existingNote = currentArchive.find((note) => note.id === id);
        const savedNote: Note = existingNote
          ? {
              ...existingNote,
              title: title.trim() || buildManuscriptTitle(content),
              content,
              favorite: favorite ?? existingNote.favorite,
              updatedAt: now,
            }
          : {
              id: crypto.randomUUID(),
              content,
              title: title.trim() || buildManuscriptTitle(content),
              favorite: Boolean(favorite),
              createdAt: now,
              updatedAt: now,
              userId: "guest",
            };

        persistGuestArchive(
          existingNote
            ? currentArchive.map((note) =>
                note.id === savedNote.id ? savedNote : note,
              )
            : [savedNote, ...currentArchive],
        );
        setActiveNote(savedNote.id);
        setSaveState("saved");
        scheduleSaveStateReset(2000);
        setSaving(false);
        return savedNote;
      }

      if (user) {
        try {
          const payload = {
            content,
            title: title.trim() || buildManuscriptTitle(content),
            ...(typeof favorite === "boolean" ? { favorite } : {}),
          };
          const response = id
            ? await api.patch(`/notes/${id}`, payload)
            : await api.post("/notes", payload);
          const savedNote = normalizeNote(response.data);

          setArchive((prev) => {
            const nextArchive = sortNotes(
              id
                ? prev.map((note) => (note.id === id ? savedNote : note))
                : [savedNote, ...prev],
            );
            archiveRef.current = nextArchive;
            return nextArchive;
          });
          setActiveNote(savedNote.id);
          if (saveSequence === saveSequenceRef.current) {
            setSaveState("saved");
            scheduleSaveStateReset(2000);
          }
          return savedNote;
        } catch {
          if (saveSequence === saveSequenceRef.current) {
            setSaveState(navigator.onLine ? "error" : "offline");
            scheduleSaveStateReset(3000);
          }
          return null;
        } finally {
          if (saveSequence === saveSequenceRef.current) {
            setSaving(false);
          }
        }
      }

      setSaving(false);
      setSaveState("idle");
      return null;
    },
    [isGuest, persistGuestArchive, scheduleSaveStateReset, user],
  );

  const duplicateNote = useCallback(
    async (note: Note) => {
      return await saveNote({
        title: `${note.title || buildManuscriptTitle(note.content)} Copy`,
        content: note.content,
        favorite: false,
      });
    },
    [saveNote],
  );

  const toggleFavorite = useCallback(
    async (note: Note) => {
      const favorite = !note.favorite;

      if (isGuest) {
        const currentArchive = archiveRef.current;
        const updatedNote = {
          ...note,
          favorite,
          updatedAt: new Date().toISOString(),
        };
        persistGuestArchive(
          currentArchive.map((item) =>
            item.id === note.id ? updatedNote : item,
          ),
        );
        return updatedNote;
      }

      try {
        const response = await api.patch(`/notes/${note.id}`, { favorite });
        const updatedNote = normalizeNote(response.data);
        setArchive((prev) => {
          const nextArchive = sortNotes(
            prev.map((item) => (item.id === note.id ? updatedNote : item)),
          );
          archiveRef.current = nextArchive;
          return nextArchive;
        });
        return updatedNote;
      } catch (error) {
        console.error("Failed to update favorite:", error);
        setSaveState(navigator.onLine ? "error" : "offline");
        scheduleSaveStateReset(3000);
        return null;
      }
    },
    [isGuest, persistGuestArchive, scheduleSaveStateReset],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (isGuest) {
        const wasActiveNote = activeNote === id;
        persistGuestArchive(archiveRef.current.filter((note) => note.id !== id));
        if (wasActiveNote) setActiveNote(null);
        return wasActiveNote;
      }

      try {
        const response = await api.delete(`/notes/${id}`);
        if (response.status === 200) {
          const wasActiveNote = activeNote === id;
          setArchive((prev) => {
            const nextArchive = prev.filter((note) => note.id !== id);
            archiveRef.current = nextArchive;
            return nextArchive;
          });
          if (wasActiveNote) {
            setActiveNote(null);
          }
          return wasActiveNote;
        }
      } catch (error) {
        console.error("Failed to delete from archive:", error);
      }
      return false;
    },
    [activeNote, isGuest, persistGuestArchive],
  );

  return {
    archive,
    activeNote,
    loading,
    saving,
    saveState,
    setActiveNote,
    saveNote,
    duplicateNote,
    toggleFavorite,
    deleteNote,
  };
}
