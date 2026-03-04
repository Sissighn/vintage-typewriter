import { useState, useEffect, useCallback } from "react";
import type { Note } from "../types/note";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { generateNewNoteTitle } from "../utils/noteFormatters";

const GUEST_STORAGE_KEY = "typewriter_guest_manuscripts";

export function useNotes() {
  const { user, isGuest } = useAuth(); //
  const [archive, setArchive] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "err" | null>(null);

  // Notizen laden: Unterscheidung zwischen Cloud und Lokal
  useEffect(() => {
    if (isGuest) {
      setLoading(true);
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      setArchive(saved ? JSON.parse(saved) : []);
      setLoading(false);
    } else if (user) {
      setLoading(true);
      api
        .get("/notes")
        .then((res) => setArchive(Array.isArray(res.data) ? res.data : []))
        .catch(() => setArchive([]))
        .finally(() => setLoading(false));
    } else {
      setArchive([]);
    }
  }, [user, isGuest]);

  const saveNote = useCallback(
    async (text: string) => {
      if (!text.trim() || saving) return;
      setSaving(true);
      setSaveMsg(null);

      if (isGuest) {
        // GAST-LOGIK: Speichern im LocalStorage
        const newGuestNote: Note = {
          id: Date.now().toString(),
          content: text,
          title: generateNewNoteTitle(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "guest",
        };
        const updatedArchive = [newGuestNote, ...archive];
        setArchive(updatedArchive);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedArchive));
        setSaveMsg("ok");
        setTimeout(() => setSaveMsg(null), 2000);
        setSaving(false);
      } else if (user) {
        // USER-LOGIK: Speichern in PostgreSQL
        try {
          const res = await api.post("/notes", {
            content: text,
            title: generateNewNoteTitle(),
          });
          setArchive((prev) => [res.data, ...prev]);
          setSaveMsg("ok");
          setTimeout(() => setSaveMsg(null), 2000);
        } catch {
          setSaveMsg("err");
          setTimeout(() => setSaveMsg(null), 2500);
        } finally {
          setSaving(false);
        }
      }
    },
    [saving, user, isGuest, archive],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to destroy this manuscript?"))
        return false;

      if (isGuest) {
        const updatedArchive = archive.filter((n) => n.id !== id);
        setArchive(updatedArchive);
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updatedArchive));
        if (activeNote === id) setActiveNote(null);
        return true;
      }

      try {
        const response = await api.delete(`/notes/${id}`);
        if (response.status === 200) {
          setArchive((prev) => prev.filter((n) => n.id !== id));
          if (activeNote === id) {
            setActiveNote(null);
            return true;
          }
        }
      } catch (error) {
        console.error("Failed to delete from archive:", error);
      }
      return false;
    },
    [activeNote, isGuest, archive],
  );

  return {
    archive,
    activeNote,
    loading,
    saving,
    saveMsg,
    setActiveNote,
    saveNote,
    deleteNote,
  };
}
