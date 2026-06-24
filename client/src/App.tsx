import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import PaperSidebar from "./components/PaperSidebar";
import WritingArea from "./components/WritingArea";
import ArchiveDrawer from "./components/ArchiveDrawer";
import AuthCard from "./components/AuthCard";
import { useAuth } from "./context/useAuth";
import type { Note } from "./types/note";

// Logic Hooks
import { useTypewriterSound } from "./hooks/useTypewriterSound";
import { useNotes } from "./hooks/useNotes";
import { useEditor } from "./hooks/useEditor";
import {
  getPaperStyle,
  resolveRibbonColor,
  type InkStrength,
  type RibbonId,
} from "./config/paperStyles";

// Utilities & Styles
import {
  buildManuscriptTitle,
  exportManuscript,
  openPrintView,
  sanitizeFileName,
  type ExportFormat,
  type PaperSize,
} from "./utils/exportManuscript";
import styles from "./App.module.css";

/**
 * Main Application Controller
 * Orchestrates the state between the editor, the archive, and the UI.
 * Schützt die Schreibmaschine vor unbefugtem Zugriff.
 */
export default function App() {
  // -- AUTHENTICATION STATE --
  // Wir holen den ECHTEN isGuest-Status aus dem Context
  const { user, isGuest, loading: authLoading } = useAuth();

  // -- CORE HOOKS --
  const { playKeySound } = useTypewriterSound();

  // Custom hook managing persistence logic (Fetch, Save, Delete)
  const {
    archive,
    activeNote,
    loading: notesLoading,
    saving,
    saveState,
    setActiveNote,
    saveNote: archiveNote,
    duplicateNote: duplicateArchiveNote,
    toggleFavorite: toggleArchiveFavorite,
    deleteNote: removeNote,
  } = useNotes();

  const saveShortcutRef = React.useRef<() => void>(() => {});
  const focusTimerRef = React.useRef<number | null>(null);

  // Custom hook managing editor mechanics (Keyboard, Cursor, Scrolling)
  const {
    text,
    setText,
    pressedKey,
    carriageReturn,
    inputRef,
    paperScrollRef,
    handleTextChange,
    handleKeyDown,
    handleKeyClick,
    focusInput,
  } = useEditor({
    playKeySound,
    saveNote: () => saveShortcutRef.current(),
  });

  // -- UI STATE --
  const [title, setTitle] = useState("Untitled Manuscript");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState({
    title: "Untitled Manuscript",
    content: "",
  });
  const [paperType, setPaperType] = useState<string>("classic");
  const [customPaperColor, setCustomPaperColor] = useState("#fff6e7");
  const [ribbonId, setRibbonId] = useState<RibbonId>("auto");
  const [inkStrength, setInkStrength] = useState<InkStrength>("normal");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [exportStatus, setExportStatus] = useState<"idle" | "working" | "error">(
    "idle",
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const [paperPanelOpen, setPaperPanelOpen] = useState(false);
  const [archivePanelOpen, setArchivePanelOpen] = useState(() =>
    window.matchMedia("(min-width: 1200px)").matches,
  );
  const compactLayout = () =>
    window.matchMedia("(max-width: 1199px)").matches;

  // -- EFFECTS --
  useEffect(() => {
    // Fokus setzen, sobald ein User oder Gast die App betritt
    if (user || isGuest) {
      focusInput();
    }
  }, [user, isGuest, focusInput]);

  useEffect(() => {
    const overlayOpen =
      compactLayout() && (paperPanelOpen || archivePanelOpen);
    document.body.style.overflow = overlayOpen ? "hidden" : "";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPaperPanelOpen(false);
        setArchivePanelOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [paperPanelOpen, archivePanelOpen]);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  // -- HANDLERS --
  const paperStyle = getPaperStyle(paperType, customPaperColor);
  const inkColor = resolveRibbonColor(ribbonId, paperStyle);
  const currentNote = archive.find((note) => note.id === activeNote);
  const hasUnsavedChanges =
    title !== lastSavedSnapshot.title || text !== lastSavedSnapshot.content;

  const focusEditorSoon = useCallback(() => {
    if (focusTimerRef.current) {
      window.clearTimeout(focusTimerRef.current);
    }

    focusTimerRef.current = window.setTimeout(() => {
      focusInput();
      focusTimerRef.current = null;
    }, 50);
  }, [focusInput]);

  const canDiscardDraft = useCallback(() => {
    if (!hasUnsavedChanges) return true;

    return window.confirm(
      "You have unsaved changes. Do you want to discard them?",
    );
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasUnsavedChanges]);

  const getExportOptions = useCallback(() => {
    const exportTitle = buildManuscriptTitle(text, title || currentNote?.title);

    return {
      text,
      title: exportTitle,
      fileName: sanitizeFileName(exportTitle),
      paperSize,
      paperStyle,
      inkColor,
      inkStrength,
    };
  }, [
    currentNote?.title,
    inkColor,
    inkStrength,
    paperSize,
    paperStyle,
    text,
    title,
  ]);

  const saveCurrentManuscript = useCallback(async () => {
    if (!text.trim()) return null;

    const savedNote = await archiveNote({
      id: activeNote,
      title,
      content: text,
      favorite: currentNote?.favorite ?? false,
    });

    if (savedNote) {
      setTitle(savedNote.title);
      setLastSavedSnapshot({
        title: savedNote.title,
        content: savedNote.content,
      });
    }

    return savedNote;
  }, [activeNote, archiveNote, currentNote?.favorite, text, title]);

  useEffect(() => {
    saveShortcutRef.current = () => {
      void saveCurrentManuscript();
    };
  }, [saveCurrentManuscript]);

  useEffect(() => {
    if (!hasUnsavedChanges || !text.trim() || saving) return;

    const autosaveTimer = window.setTimeout(() => {
      void saveCurrentManuscript();
    }, 1400);

    return () => window.clearTimeout(autosaveTimer);
  }, [hasUnsavedChanges, saveCurrentManuscript, saving, text]);

  const loadNote = useCallback(
    (note: Note, skipConfirm = false) => {
      if (!skipConfirm && !canDiscardDraft()) return;
      setText(note.content);
      setTitle(note.title);
      setLastSavedSnapshot({ title: note.title, content: note.content });
      setActiveNote(note.id);
      if (compactLayout()) setArchivePanelOpen(false);
      focusEditorSoon();
    },
    [canDiscardDraft, focusEditorSoon, setActiveNote, setText],
  );

  const newManuscript = useCallback((skipConfirm = false) => {
    if (!skipConfirm && !canDiscardDraft()) return;
    setActiveNote(null);
    setText("");
    setTitle("Untitled Manuscript");
    setLastSavedSnapshot({ title: "Untitled Manuscript", content: "" });
    focusEditorSoon();
  }, [canDiscardDraft, focusEditorSoon, setActiveNote, setText]);

  const deleteNote = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const wasActiveNote = await removeNote(id);
      if (wasActiveNote) {
        newManuscript(true);
      }
    },
    [newManuscript, removeNote],
  );

  const duplicateNote = useCallback(
    async (note: Note, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!canDiscardDraft()) return;
      const duplicatedNote = await duplicateArchiveNote(note);
      if (duplicatedNote) loadNote(duplicatedNote, true);
    },
    [canDiscardDraft, duplicateArchiveNote, loadNote],
  );

  const toggleFavorite = useCallback(
    async (note: Note, event: React.MouseEvent) => {
      event.stopPropagation();
      const updatedNote = await toggleArchiveFavorite(note);
      if (updatedNote && activeNote === updatedNote.id) {
        setLastSavedSnapshot({
          title: updatedNote.title,
          content: updatedNote.content,
        });
      }
    },
    [activeNote, toggleArchiveFavorite],
  );

  const handleExport = useCallback(async () => {
    if (!text.trim()) return;
    setExportStatus("working");
    setExportError(null);

    try {
      await exportManuscript({
        ...getExportOptions(),
        format: exportFormat,
      });
      setExportStatus("idle");
    } catch (error) {
      console.error("Export failed:", error);
      setExportError(
        error instanceof Error
          ? error.message
          : "Export failed. Please try again.",
      );
      setExportStatus("error");
    }
  }, [exportFormat, getExportOptions, text]);

  const handlePrint = useCallback(() => {
    if (!text.trim()) return;
    setExportError(null);

    try {
      openPrintView(getExportOptions());
      setExportStatus("idle");
    } catch (error) {
      console.error("Print view failed:", error);
      setExportError(
        error instanceof Error
          ? error.message
          : "Print view failed. Please try again.",
      );
      setExportStatus("error");
    }
  }, [getExportOptions, text]);

  const setPaperOpen = (open: boolean) => {
    setPaperPanelOpen(open);
    if (open && compactLayout()) setArchivePanelOpen(false);
  };

  const setArchiveOpen = (open: boolean) => {
    setArchivePanelOpen(open);
    if (open && compactLayout()) setPaperPanelOpen(false);
  };

  const closePanels = () => {
    setPaperPanelOpen(false);
    setArchivePanelOpen(false);
  };

  // -- RENDER LOGIC: LOADING STATE --
  // Verhindert das Aufblinken der UI während des Session-Checks
  if (authLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingText}>Initializing Stationery...</div>
      </div>
    );
  }

  // -- RENDER LOGIC: AUTH GUARD --
  // Zeige die AuthCard NUR, wenn kein User eingeloggt UND kein Gast-Modus aktiv ist
  if (!user && !isGuest) {
    return <AuthCard />;
  }

  // -- MAIN UI (Sichtbar für eingeloggte User ODER Gäste) --
  return (
    <div className={styles.appContainer} onClick={focusInput}>
      <Header />

      {(paperPanelOpen || archivePanelOpen) && (
        <button
          type="button"
          className={styles.panelBackdrop}
          onClick={(event) => {
            event.stopPropagation();
            closePanels();
          }}
          aria-label="Close open panel"
        />
      )}

      <div className={styles.mainLayout}>
        {/* LEFT: Fixed Stationery Configurator */}
        <PaperSidebar
          currentType={paperType}
          onTypeChange={(id) => setPaperType(id)}
          customPaperColor={customPaperColor}
          onCustomPaperColorChange={setCustomPaperColor}
          ribbonId={ribbonId}
          onRibbonChange={setRibbonId}
          inkStrength={inkStrength}
          onInkStrengthChange={setInkStrength}
          open={paperPanelOpen}
          onOpenChange={setPaperOpen}
        />

        {/* CENTER: Writing Area */}
        <WritingArea
          text={text}
          title={title}
          activeNoteId={activeNote}
          hasUnsavedChanges={hasUnsavedChanges}
          paperStyle={paperStyle}
          inkColor={inkColor}
          inkStrength={inkStrength}
          exportFormat={exportFormat}
          paperSize={paperSize}
          exportStatus={exportStatus}
          exportError={exportError}
          pressedKey={pressedKey}
          carriageReturn={carriageReturn}
          saving={saving}
          saveState={saveState}
          inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
          paperScrollRef={paperScrollRef as React.RefObject<HTMLDivElement>}
          handleTextChange={handleTextChange}
          onTitleChange={setTitle}
          handleKeyDown={handleKeyDown}
          handleKeyClick={handleKeyClick}
          focusInput={focusInput}
          onNew={newManuscript}
          onSave={saveCurrentManuscript}
          onExport={handleExport}
          onPrint={handlePrint}
          onExportFormatChange={setExportFormat}
          onPaperSizeChange={setPaperSize}
        />

        {/* RIGHT: Box-style Archive Drawer */}
        <ArchiveDrawer
          archive={archive}
          loading={notesLoading}
          activeNote={activeNote}
          onLoad={loadNote}
          onDelete={deleteNote}
          onDuplicate={duplicateNote}
          onToggleFavorite={toggleFavorite}
          open={archivePanelOpen}
          onOpenChange={setArchiveOpen}
        />
      </div>
    </div>
  );
}
