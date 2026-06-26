import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onDelete: (id: string) => void;
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
  const [pendingDeleteNote, setPendingDeleteNote] = useState<Note | null>(null);
  const [discardGuestDialogOpen, setDiscardGuestDialogOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(open);

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

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      toggleRef.current?.focus();
    }

    if (!open && wasOpenRef.current) {
      window.setTimeout(() => launcherRef.current?.focus(), 0);
    }

    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!pendingDeleteNote && !discardGuestDialogOpen) return;

    cancelDeleteRef.current?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingDeleteNote(null);
        setDiscardGuestDialogOpen(false);
        lastTriggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll<
        HTMLButtonElement
      >("button:not(:disabled)");
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleDialogKeyDown);
    return () => window.removeEventListener("keydown", handleDialogKeyDown);
  }, [discardGuestDialogOpen, pendingDeleteNote]);

  /**
   * Löscht die lokalen Gast-Notizen, falls der User sie nicht importieren möchte.
   */
  const handleDiscardGuestNotes = () => {
    clearGuestNotes();
    setGuestNotesAvailable(false);
    setDiscardGuestDialogOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
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
            ref={toggleRef}
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
                      type="button"
                      onClick={migrateGuestNotes}
                      className={styles.migrationBtn}
                    >
                      SAVE TO ACCOUNT
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        lastTriggerRef.current = event.currentTarget;
                        setDiscardGuestDialogOpen(true);
                      }}
                      className={styles.discardBtn}
                    >
                      DISCARD
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <p className={styles.noManuscripts} aria-live="polite">
                  LOADING ARCHIVE...
                </p>
              ) : !Array.isArray(archive) || archive.length === 0 ? (
                <p className={styles.noManuscripts}>NO MANUSCRIPTS FOUND</p>
              ) : (
                <>
                  <div className={styles.archiveTools}>
                    <label className={styles.toolLabel} htmlFor="archive-search">
                      Search
                    </label>
                    <input
                      id="archive-search"
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search archive..."
                      aria-label="Search archive"
                    />
                    <div className={styles.archiveControls}>
                      <label className={styles.toolLabel} htmlFor="archive-sort">
                        Sort
                      </label>
                      <select
                        id="archive-sort"
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
                        aria-label={
                          favoritesOnly
                            ? "Show all manuscripts"
                            : "Show favorite manuscripts only"
                        }
                      >
                        ★
                      </button>
                    </div>
                  </div>

                  {filteredArchive.length === 0 ? (
                    <p className={styles.noManuscripts}>NO MATCHES FOUND</p>
                  ) : (
                    filteredArchive.map((note, idx) => (
                      <article
                        key={note.id}
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
                        <button
                          type="button"
                          className={styles.noteMainButton}
                          onClick={() => onLoad(note)}
                          aria-current={activeNote === note.id ? "true" : undefined}
                        >
                          <div className={styles.noteHeader}>
                            <div className={styles.noteTitle}>{note.title}</div>
                          </div>
                          <p className={styles.noteExcerpt}>
                            {note.content.slice(0, 96) || "Empty manuscript"}
                          </p>
                          <span className={styles.noteDate}>
                            {formatDateForDisplay(note.updatedAt)}
                          </span>
                        </button>
                        <div className={styles.noteSideActions}>
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
                        <div className={styles.noteMeta}>
                          <div className={styles.noteActions}>
                            <button
                              type="button"
                              className={styles.metaButton}
                              onClick={(e) => onDuplicate(note, e)}
                            >
                              COPY
                            </button>
                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                lastTriggerRef.current = event.currentTarget;
                                setPendingDeleteNote(note);
                              }}
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </article>
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

      {(pendingDeleteNote || discardGuestDialogOpen) && (
        <div
          className={styles.dialogBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPendingDeleteNote(null);
              setDiscardGuestDialogOpen(false);
              lastTriggerRef.current?.focus();
            }
          }}
        >
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
          >
            <h2 id="delete-dialog-title" className={styles.dialogTitle}>
              {pendingDeleteNote
                ? "Destroy manuscript?"
                : "Discard guest notes?"}
            </h2>
            <p id="delete-dialog-description" className={styles.dialogText}>
              {pendingDeleteNote
                ? `This permanently removes “${pendingDeleteNote.title}” from your archive.`
                : "This permanently removes the local guest manuscripts from this browser."}
            </p>
            <div className={styles.dialogActions}>
              <button
                ref={cancelDeleteRef}
                type="button"
                className={styles.dialogCancel}
                onClick={() => {
                  setPendingDeleteNote(null);
                  setDiscardGuestDialogOpen(false);
                  lastTriggerRef.current?.focus();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.dialogDanger}
                onClick={() => {
                  if (pendingDeleteNote) {
                    onDelete(pendingDeleteNote.id);
                    setPendingDeleteNote(null);
                  } else {
                    handleDiscardGuestNotes();
                  }
                  lastTriggerRef.current?.focus();
                }}
              >
                {pendingDeleteNote ? "Delete" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
