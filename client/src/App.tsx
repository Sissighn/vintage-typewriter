import React, { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import PaperSidebar from "./components/PaperSidebar";
import WritingArea from "./components/WritingArea";
import ArchiveDrawer from "./components/ArchiveDrawer";
import type { Note } from "./components/ArchiveDrawer";

// Logic Hooks
import { useTypewriterSound } from "./hooks/useTypewriterSound";
import { useNotes } from "./hooks/useNotes";
import { useEditor } from "./hooks/useEditor";

// Utilities & Styles
import { downloadComponentAsImage } from "./utils/exportImage";
import styles from "./App.module.css";

/**
 * Main Application Controller
 * Orchestrates the state between the editor, the archive, and the UI.
 * Copyright 2026 Setayesh Golshan.
 */
export default function App() {
  // -- CORE HOOKS --
  const { playKeySound } = useTypewriterSound();

  // Custom hook managing persistence logic (Fetch, Save, Delete)
  const {
    archive,
    activeNote,
    loading,
    saving,
    saveMsg,
    setActiveNote,
    saveNote: archiveNote,
    deleteNote: removeNote,
  } = useNotes();

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
    saveNote: () => archiveNote(text),
  });

  // -- UI STATE --
  const [paperType, setPaperType] = useState<string>("classic");

  // -- EFFECTS --
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // -- HANDLERS --

  /**
   * Loads a specific manuscript from the archive onto the paper.
   */
  const loadNote = useCallback(
    (note: Note) => {
      setText(note.content);
      setActiveNote(note.id);
      setTimeout(focusInput, 50);
    },
    [setText, setActiveNote, focusInput],
  );

  /**
   * Removes a note from the database and clears the paper if it was active.
   */
  const deleteNote = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const wasActiveNote = await removeNote(id);
      if (wasActiveNote) {
        setText("");
      }
    },
    [removeNote, setText],
  );

  /**
   * Triggers the DOM-to-Image conversion for the current manuscript.
   */
  const handleExportImage = useCallback(() => {
    if (!text.trim()) return;
    const fileName = `Manuscript_${new Date().toISOString().slice(0, 10)}`;
    downloadComponentAsImage("paper-sheet", fileName);
  }, [text]);

  return (
    <div className={styles.appContainer} onClick={focusInput}>
      {/* Note: Ensure styles.appContainer provides the pl-[60px] 
          padding to accommodate the fixed PaperSidebar.
      */}

      <Header />

      <div className={styles.mainLayout}>
        {/* LEFT: Fixed Stationery Configurator */}
        <PaperSidebar
          currentType={paperType}
          onTypeChange={(id) => setPaperType(id)}
        />

        {/* CENTER: Writing Area 
            Contains the Paper (with id="paper-sheet") and the Typewriter illustration.
        */}
        <WritingArea
          text={text}
          paperType={paperType}
          pressedKey={pressedKey}
          carriageReturn={carriageReturn}
          saving={saving}
          saveMsg={saveMsg}
          inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
          paperScrollRef={paperScrollRef as React.RefObject<HTMLDivElement>}
          handleTextChange={handleTextChange}
          handleKeyDown={handleKeyDown}
          handleKeyClick={handleKeyClick}
          focusInput={focusInput}
          onSave={() => archiveNote(text)}
          onExport={handleExportImage}
        />

        {/* RIGHT: Box-style Archive Drawer */}
        <ArchiveDrawer
          archive={archive}
          loading={loading}
          activeNote={activeNote}
          onLoad={loadNote}
          onDelete={deleteNote}
        />
      </div>
    </div>
  );
}
