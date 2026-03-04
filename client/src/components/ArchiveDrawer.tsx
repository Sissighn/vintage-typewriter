import React, { useState } from "react";
import styles from "./ArchiveDrawer.module.css";
import { useAuth } from "../context/AuthContext"; // Import für die User-Prüfung
import type { Note } from "../types/note";
import {
  formatNoteTitleForDisplay,
  formatDateForDisplay,
} from "../utils/noteFormatters";

export type { Note };

const TAB_COLORS = ["#E8E4DF", "#D6C8BE", "#F4C2C2", "#E0DED7", "#F5F2ED"];
const GUEST_STORAGE_KEY = "typewriter_guest_manuscripts"; // Muss identisch zum Context sein

interface ArchiveDrawerProps {
  archive: Note[];
  loading: boolean;
  activeNote: string | null;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function ArchiveDrawer({
  archive,
  loading,
  activeNote,
  onLoad,
  onDelete,
}: ArchiveDrawerProps) {
  const [open, setOpen] = useState(true);
  const { user, migrateGuestNotes } = useAuth(); // Zugriff auf Auth-Daten und Migration

  /**
   * Löscht die lokalen Gast-Notizen, falls der User sie nicht importieren möchte.
   */
  const handleDiscardGuestNotes = () => {
    if (window.confirm("Do you want to permanently discard the guest notes?")) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      window.location.reload(); // Neuladen, um die UI zu aktualisieren
    }
  };

  return (
    <aside
      className={`${styles.aside} ${open ? styles.open : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`${styles.cardBox} ${open ? styles.open : ""}`}>
        <button onClick={() => setOpen(!open)} className={styles.toggleButton}>
          <span className={styles.toggleLabel}>
            {open ? "CLOSE" : "ARCHIVE"}
          </span>
          <span className={`${styles.toggleIcon} ${open ? styles.open : ""}`}>
            ▼
          </span>
        </button>

        <div className={styles.innerContent}>
          {open ? (
            <div className={`${styles.cabinetScroll} cabinet-scroll`}>
              {/* --- NEU: MIGRATIONS-BANNER --- */}
              {user && localStorage.getItem(GUEST_STORAGE_KEY) && (
                <div className={styles.migrationAlert}>
                  <p className={styles.migrationText}>GUEST NOTES FOUND</p>
                  <div className={styles.migrationActions}>
                    <button
                      onClick={migrateGuestNotes}
                      className={styles.migrationBtn}
                    >
                      SAVE TO ACCOUNT
                    </button>
                    <button
                      onClick={handleDiscardGuestNotes}
                      className={styles.discardBtn}
                    >
                      DISCARD
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <p className={styles.noManuscripts}>LOADING ARCHIVE...</p>
              ) : !Array.isArray(archive) || archive.length === 0 ? (
                <p className={styles.noManuscripts}>NO MANUSCRIPTS FOUND</p>
              ) : (
                archive.map((note, idx) => (
                  <div
                    key={note.id}
                    onClick={() => onLoad(note)}
                    className={`${styles.noteCard} ${activeNote === note.id ? styles.active : ""}`}
                  >
                    <div
                      className={styles.noteTab}
                      style={{
                        background: TAB_COLORS[idx % TAB_COLORS.length],
                      }}
                    />
                    <div className={styles.noteTitle}>
                      {formatNoteTitleForDisplay(note.content)}
                    </div>
                    <div className={styles.noteMeta}>
                      <span className={styles.noteDate}>
                        {formatDateForDisplay(note.createdAt)}
                      </span>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(note.id, e);
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className={styles.closedView}>
              {Array.from({
                length: Math.min(
                  Array.isArray(archive) ? archive.length : 0 || 3,
                  6,
                ),
              }).map((_, i) => (
                <div
                  key={i}
                  className={styles.closedViewLine}
                  style={{ opacity: 1 - i * 0.15 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
