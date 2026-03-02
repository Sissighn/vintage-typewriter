import React, { useState } from "react";
import styles from "./ArchiveDrawer.module.css";
import type { Note } from "../types/note";
import {
  formatNoteTitleForDisplay,
  formatDateForDisplay,
} from "../utils/noteFormatters";

export type { Note };

const TAB_COLORS = ["#E8E4DF", "#D6C8BE", "#F4C2C2", "#E0DED7", "#F5F2ED"];

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

  return (
    <aside
      className={`${styles.aside} ${open ? styles.open : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── MINIMALIST CARD BOX ── */}
      <div className={`${styles.cardBox} ${open ? styles.open : ""}`}>
        {/* Box Top / Toggle */}
        <button onClick={() => setOpen(!open)} className={styles.toggleButton}>
          <span className={styles.toggleLabel}>
            {open ? "CLOSE" : "ARCHIVE"}
          </span>
          <span className={`${styles.toggleIcon} ${open ? styles.open : ""}`}>
            ▼
          </span>
        </button>

        {/* Inner Content (The Cards) */}
        <div className={styles.innerContent}>
          {open ? (
            <div className={`${styles.cabinetScroll} cabinet-scroll`}>
              {loading ? (
                <p className={styles.noManuscripts}>LOADING ARCHIVE...</p>
              ) : archive.length === 0 ? (
                <p className={styles.noManuscripts}>NO MANUSCRIPTS FOUND</p>
              ) : (
                archive.map((note, idx) => (
                  <div
                    key={note.id}
                    onClick={() => onLoad(note)}
                    className={`${styles.noteCard} ${
                      activeNote === note.id ? styles.active : ""
                    }`}
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
            /* Closed State: Minimalist stacked card edges */
            <div className={styles.closedView}>
              {Array.from({ length: Math.min(archive.length || 3, 6) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={styles.closedViewLine}
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
