import React, { useMemo, useState } from "react";
import styles from "./ArchiveDrawer.module.css";
import { useAuth } from "../context/useAuth";
import type { Note } from "../types/note";
import { formatDateForDisplay } from "../utils/noteFormatters";
import { clearGuestNotes, hasGuestNotes } from "../utils/guestNotesStorage";

export type { Note };

const TAB_COLORS = ["#E8E4DF", "#D6C8BE", "#F4C2C2", "#E0DED7", "#F5F2ED"];

interface ArchiveDrawerProps {
  archive: Note[];
  loading: boolean;
  activeNote: string | null;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (note: Note, e: React.MouseEvent) => void;
  onToggleFavorite: (note: Note, e: React.MouseEvent) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ArchiveDrawer({
  archive,
  loading,
  activeNote,
  onLoad,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  open,
  onOpenChange,
}: ArchiveDrawerProps) {
  const { user, migrateGuestNotes } = useAuth(); // Zugriff auf Auth-Daten und Migration
  const [guestNotesAvailable, setGuestNotesAvailable] = useState(() =>
    hasGuestNotes(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<"updated" | "created" | "title">(
    "updated",
  );
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredArchive = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return archive
      .filter((note) => {
        if (favoritesOnly && !note.favorite) return false;
        if (!query) return true;

        return `${note.title} ${note.content}`.toLowerCase().includes(query);
      })
      .sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        if (sortMode === "title") return a.title.localeCompare(b.title);
        const dateKey = sortMode === "created" ? "createdAt" : "updatedAt";
        return (
          new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime()
        );
      });
  }, [archive, favoritesOnly, searchQuery, sortMode]);

  /**
   * Löscht die lokalen Gast-Notizen, falls der User sie nicht importieren möchte.
   */
  const handleDiscardGuestNotes = () => {
    if (window.confirm("Do you want to permanently discard the guest notes?")) {
      clearGuestNotes();
      setGuestNotesAvailable(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className={styles.launcher}
          onClick={(event) => {
            event.stopPropagation();
            onOpenChange(true);
          }}
          aria-controls="archive-panel"
          aria-expanded="false"
        >
          ARCHIVE
          {archive.length > 0 && (
            <span className={styles.launcherCount}>{archive.length}</span>
          )}
        </button>
      )}

      <aside
        id="archive-panel"
        className={`${styles.aside} ${open ? styles.open : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.cardBox} ${open ? styles.open : ""}`}>
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            className={styles.toggleButton}
            aria-expanded={open}
            aria-controls="archive-content"
          >
          <span className={styles.toggleLabel}>
            {open ? "CLOSE" : "ARCHIVE"}
          </span>
          <span className={`${styles.toggleIcon} ${open ? styles.open : ""}`}>
            ▼
          </span>
        </button>

          <div id="archive-content" className={styles.innerContent}>
          {open ? (
            <div className={`${styles.cabinetScroll} cabinet-scroll`}>
              {/* --- NEU: MIGRATIONS-BANNER --- */}
              {user && guestNotesAvailable && (
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
                <>
                  <div className={styles.archiveTools}>
                    <input
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search archive..."
                      aria-label="Search archive"
                    />
                    <div className={styles.archiveControls}>
                      <select
                        className={styles.sortSelect}
                        value={sortMode}
                        onChange={(event) =>
                          setSortMode(
                            event.target.value as "updated" | "created" | "title",
                          )
                        }
                        aria-label="Sort archive"
                      >
                        <option value="updated">Recently updated</option>
                        <option value="created">Newest first</option>
                        <option value="title">Title A-Z</option>
                      </select>
                      <button
                        type="button"
                        className={`${styles.filterButton} ${
                          favoritesOnly ? styles.filterButtonActive : ""
                        }`}
                        onClick={() => setFavoritesOnly((value) => !value)}
                        aria-pressed={favoritesOnly}
                      >
                        ★
                      </button>
                    </div>
                  </div>

                  {filteredArchive.length === 0 ? (
                    <p className={styles.noManuscripts}>NO MATCHES FOUND</p>
                  ) : (
                    filteredArchive.map((note, idx) => (
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
                        <div className={styles.noteHeader}>
                          <div className={styles.noteTitle}>{note.title}</div>
                          <button
                            type="button"
                            className={`${styles.favoriteButton} ${
                              note.favorite ? styles.favoriteButtonActive : ""
                            }`}
                            onClick={(e) => onToggleFavorite(note, e)}
                            aria-label={
                              note.favorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            ★
                          </button>
                        </div>
                        <p className={styles.noteExcerpt}>
                          {note.content.slice(0, 96) || "Empty manuscript"}
                        </p>
                        <div className={styles.noteMeta}>
                          <span className={styles.noteDate}>
                            {formatDateForDisplay(note.updatedAt)}
                          </span>
                          <div className={styles.noteActions}>
                            <button
                              className={styles.metaButton}
                              onClick={(e) => onDuplicate(note, e)}
                            >
                              COPY
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={(e) => onDelete(note.id, e)}
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.closedView}>
              {Array.from({
                length: Math.min(
                  archive.length || 3,
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
    </>
  );
}
