import React, { useState, useCallback, useEffect } from "react";
import ArchiveDrawer from "./components/ArchiveDrawer";
import type { Note } from "./components/ArchiveDrawer";
import { useTypewriterSound } from "./hooks/useTypewriterSound";
import { useNotes } from "./hooks/useNotes";
import { useEditor } from "./hooks/useEditor";

import Header from "./components/Header";
import PaperSidebar from "./components/PaperSidebar";
import WritingArea from "./components/WritingArea";
import styles from "./App.module.css";
import "./styles/global.css";

export default function App() {
  // -- CORE HOOKS --
  const { playKeySound } = useTypewriterSound();
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

  // -- STATE & UI --
  const [paperType, setPaperType] = useState<string>("classic");

  // -- EFFECT: FOCUS ON START --
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // -- HANDLERS (Bridging hooks and UI) --
  const loadNote = useCallback(
    (note: Note) => {
      setText(note.content);
      setActiveNote(note.id);
      setTimeout(focusInput, 50);
    },
    [setText, setActiveNote, focusInput],
  );

  const deleteNote = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent loading the note while deleting
      const wasActiveNote = await removeNote(id);
      if (wasActiveNote) {
        setText(""); // Clear paper if the active note was deleted
      }
    },
    [removeNote, setText],
  );

  // -- RENDER --
  return (
    <div className={styles.appContainer} onClick={focusInput}>
      <Header />

      {/* -- MAIN LAYOUT (Sidebars + Writing Area) -- */}
      <div className={styles.mainLayout}>
        {/* LEFT: Paper Configurator Sidebar */}
        <PaperSidebar
          currentType={paperType}
          onTypeChange={(id) => setPaperType(id)}
        />

        {/* CENTER: Writing Area */}
        <WritingArea
          text={text}
          paperType={paperType}
          pressedKey={pressedKey}
          carriageReturn={carriageReturn}
          saving={saving}
          saveMsg={saveMsg}
          inputRef={inputRef}
          paperScrollRef={paperScrollRef}
          handleTextChange={handleTextChange}
          handleKeyDown={handleKeyDown}
          handleKeyClick={handleKeyClick}
          saveNote={() => archiveNote(text)}
          focusInput={focusInput}
        />

        {/* RIGHT: Archive Drawer */}
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
