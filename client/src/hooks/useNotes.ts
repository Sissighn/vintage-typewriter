import { useState, useEffect, useCallback } from "react";
import type { Note } from "../components/ArchiveDrawer";
import { API_URL } from "../config/editorConfig";
import { generateNewNoteTitle } from "../utils/noteFormatters";

export function useNotes() {
  const [archive, setArchive] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "err" | null>(null);

  // Initial fetch for notes
  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data: Note[]) => {
        setArchive(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveNote = useCallback(
    async (text: string) => {
      if (!text.trim() || saving) return;
      setSaving(true);
      setSaveMsg(null);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text,
            title: generateNewNoteTitle(),
          }),
        });
        if (!res.ok) throw new Error();
        const saved: Note = await res.json();
        setArchive((prev) => [saved, ...prev]);
        setSaveMsg("ok");
        setTimeout(() => setSaveMsg(null), 2000);
      } catch {
        setSaveMsg("err");
        setTimeout(() => setSaveMsg(null), 2500);
      } finally {
        setSaving(false);
      }
    },
    [saving],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to destroy this manuscript?"))
        return false;

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setArchive((prev) => prev.filter((n) => n.id !== id));
          if (activeNote === id) {
            setActiveNote(null);
            return true; // Indicates that the active note was deleted
          }
        }
      } catch (error) {
        console.error("Failed to delete from archive:", error);
      }
      return false; // Indicates active note was not deleted
    },
    [activeNote],
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
