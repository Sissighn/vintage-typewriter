import { useState, useEffect, type ReactNode } from "react";
import api from "../api/axiosInstance";
import type { Note } from "../types/note";
import {
  AuthContext,
  type LoginCredentials,
  type RegisterData,
  type User,
} from "./authContextValue";

const GUEST_STORAGE_KEY = "typewriter_guest_manuscripts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- HILFSFUNKTION: MIGRATION ---
  /**
   * Scannt den LocalStorage nach Gast-Notizen und lädt sie ins Backend hoch.
   * Danach wird der lokale Speicher bereinigt.
   */
  const migrateGuestNotes = async () => {
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const guestNotes = parsed.filter(
        (note): note is Note =>
          typeof note === "object" &&
          note !== null &&
          "content" in note &&
          typeof note.content === "string",
      );
      if (guestNotes.length === 0) return;

      // Sende alle Notizen parallel an das Backend
      await Promise.all(
        guestNotes.map((note) =>
          api.post("/notes", {
            content: note.content,
            title: note.title || "Migrated Manuscript",
          }),
        ),
      );

      // Erfolg: Lokalen Speicher leeren
      localStorage.removeItem(GUEST_STORAGE_KEY);
      window.location.reload();
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Could not migrate notes. Please try again.");
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setIsGuest(false);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error("Auth check failed:", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const res = await api.post("/auth/login", credentials);
    setUser(res.data.user);
    setIsGuest(false);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post("/auth/register", data);
    setUser(res.data.user);
    setIsGuest(false);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res = await api.post("/auth/google", { idToken });
    setUser(res.data.user);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    setIsGuest(false);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        login,
        register,
        loginWithGoogle,
        continueAsGuest,
        migrateGuestNotes,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
