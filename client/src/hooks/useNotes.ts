import { useState, useEffect, useCallback } from "react";
import type { Note } from "../types/note";
import api from "../api/axiosInstance"; // WICHTIG: Nutze Axios für Cookies
import { useAuth } from "../context/AuthContext"; //
import { generateNewNoteTitle } from "../utils/noteFormatters";

export function useNotes() {
  const { user } = useAuth(); // Hol dir den Login-Status
  const [archive, setArchive] = useState<Note[]>([]); // Initialisiert als leeres Array []
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "err" | null>(null);

  // Notizen laden: Nur wenn ein User eingeloggt ist
  useEffect(() => {
    if (!user) {
      setArchive([]);
      return;
    }

    setLoading(true);
    api
      .get("/notes")
      .then((res) => {
        // Sicherstellen, dass wir IMMER ein Array setzen
        setArchive(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setArchive([]);
      })
      .finally(() => setLoading(false));
  }, [user]); // Reagiert auf Login/Logout

  const saveNote = useCallback(
    async (text: string) => {
      if (!text.trim() || saving || !user) return;
      setSaving(true);
      setSaveMsg(null);
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
    },
    [saving, user],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to destroy this manuscript?"))
        return false;

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
