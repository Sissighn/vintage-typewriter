import React from "react";
import Typewriter from "./Typewriter";
import styles from "./WritingArea.module.css";
import type { ExportFormat, PaperSize } from "../utils/exportManuscript";
import type { InkStrength, PaperStyle } from "../config/paperStyles";
import { INK_STRENGTHS } from "../config/paperStyles";
import {
  LINE_HEIGHT,
  MAX_CHARS,
  PAPER_H,
  PAPER_PAD_V,
} from "../config/editorConfig";
import type { SaveState } from "../hooks/useNotes";

interface WritingAreaProps {
  // State
  text: string;
  title: string;
  activeNoteId: string | null;
  hasUnsavedChanges: boolean;
  paperStyle: PaperStyle;
  inkColor: string;
  inkStrength: InkStrength;
  exportFormat: ExportFormat;
  paperSize: PaperSize;
  exportStatus: "idle" | "working" | "error";
  exportError: string | null;
  pressedKey: string;
  carriageReturn: number;
  saving: boolean;
  saveState: SaveState;
  // Refs
  inputRef: React.RefObject<HTMLTextAreaElement>;
  paperScrollRef: React.RefObject<HTMLDivElement>;
  // Handlers
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onTitleChange: (title: string) => void;
  handleKeyClick: (value: string, type: "char" | "key") => void;
  onNew: () => void;
  onSave: () => void | Promise<unknown>;
  onExport: () => void;
  onPrint: () => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onPaperSizeChange: (paperSize: PaperSize) => void;
  focusInput: () => void;
}

export default function WritingArea({
  text,
  title,
  activeNoteId,
  hasUnsavedChanges,
  paperStyle,
  inkColor,
  inkStrength,
  exportFormat,
  paperSize,
  exportStatus,
  exportError,
  pressedKey,
  carriageReturn,
  saving,
  saveState,
  inputRef,
  paperScrollRef,
  handleTextChange,
  handleKeyDown,
  onTitleChange,
  handleKeyClick,
  onNew,
  onSave,
  onExport,
  onPrint,
  onExportFormatChange,
  onPaperSizeChange,
  focusInput,
}: WritingAreaProps) {
  const ink = INK_STRENGTHS[inkStrength];
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characterCount = text.length;
  const lineCount = Math.max(1, text.split("\n").length);
  const estimatedWrappedLines = Math.max(lineCount, Math.ceil(text.length / 54));
  const pageCount = Math.max(1, Math.ceil((estimatedWrappedLines * LINE_HEIGHT) / 760));

  return (
    <div className={styles.writingAreaContainer} onClick={focusInput}>
      <div className={styles.editorHeader} onClick={(e) => e.stopPropagation()}>
        <label className={styles.titleLabel} htmlFor="manuscript-title">
          Manuscript title
        </label>
        <input
          id="manuscript-title"
          className={`${styles.titleInput} ${
            hasUnsavedChanges ? styles.titleInputDirty : ""
          }`}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={90}
          placeholder="Untitled Manuscript"
        />
        <div className={styles.editorMeta}>
          <span>{activeNoteId ? "Editing archived manuscript" : "New manuscript"}</span>
          {hasUnsavedChanges && <span className={styles.dirtyDot}>Unsaved changes</span>}
        </div>
      </div>

      {/* -- PAPER SHEET -- */}
      <div className={styles.paperContainer}>
        <div
          id="paper-sheet" // Unique ID required for html2canvas capture
          ref={paperScrollRef}
          className={`${styles.paperScroll} paper-scroll`}
          style={{
            height: PAPER_H,
            background: paperStyle.background,
            backgroundSize: paperStyle.backgroundSize || "auto",
            borderColor: paperStyle.borderColor || "#e8e4df",
            boxShadow: paperStyle.shadow || undefined,
          }}
        >
          {text.length === 0 && (
            <div
              className={styles.placeholder}
              style={{
                top: `${PAPER_PAD_V}px`,
                color: inkColor,
                opacity: 0.35,
              }}
            >
              Begin your manuscript...
            </div>
          )}
          <textarea
            className={styles.textarea}
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
            aria-label="Manuscript input"
            style={{
              padding: `${PAPER_PAD_V}px 26px`,
              color: inkColor,
              caretColor: inkColor,
              opacity: ink.opacity,
              fontWeight: ink.fontWeight,
              textShadow: ink.shadow,
            }}
          />
        </div>
        <div className={styles.rollerShadow} />
      </div>

      {/* -- MECHANICAL ILLUSTRATION -- */}
      <div className={styles.typewriterIllustration}>
        <Typewriter
          pressedKey={pressedKey}
          onKeyClick={handleKeyClick}
          carriageReturn={carriageReturn}
        />
      </div>

      {/* -- ACTION FOOTER -- */}
      <div className={styles.actionFooter} onClick={(e) => e.stopPropagation()}>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onNew}
            type="button"
          >
            New Manuscript
          </button>

          <button
            className={`${styles.actionButton} ${styles.primaryButton} ${saving ? styles.saving : ""}`}
            onClick={onSave}
            disabled={saving || !text.trim()}
            type="button"
          >
            {saving ? "Saving..." : activeNoteId ? "Save Changes" : "Save Manuscript"}
          </button>

          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onExport}
            disabled={!text.trim() || exportStatus === "working"}
            type="button"
          >
            {exportStatus === "working" ? "Exporting..." : "Export"}
          </button>

          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onPrint}
            disabled={!text.trim() || exportStatus === "working"}
            type="button"
          >
            Print View
          </button>
        </div>

        <div className={styles.exportPanel}>
          <label className={styles.exportControl}>
            <span>Format</span>
            <select
              value={exportFormat}
              onChange={(event) =>
                onExportFormatChange(event.target.value as ExportFormat)
              }
            >
              <option value="png">PNG</option>
              <option value="txt">TXT</option>
              <option value="md">Markdown</option>
              <option value="pdf">PDF</option>
            </select>
          </label>

          <label className={styles.exportControl}>
            <span>Paper</span>
            <select
              value={paperSize}
              onChange={(event) =>
                onPaperSizeChange(event.target.value as PaperSize)
              }
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </label>
        </div>

        <div className={styles.counterPanel} aria-label="Manuscript statistics">
          <span>{wordCount} Words</span>
          <span>{characterCount}/{MAX_CHARS} Characters</span>
          <span>{pageCount} {pageCount === 1 ? "Page" : "Pages"}</span>
        </div>

        {/* Status Indicators */}
        <div
          className={styles.statusContainer}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {saveState === "saving" && <span className={styles.statusWarn}>Saving...</span>}
          {saveState === "saved" && <span className={styles.statusOk}>✓ Saved</span>}
          {saveState === "offline" && <span className={styles.statusErr}>Offline</span>}
          {saveState === "error" && <span className={styles.statusErr}>✗ Save error</span>}
          {saveState === "idle" && hasUnsavedChanges && (
            <span className={styles.statusWarn}>Unsaved changes</span>
          )}
          {exportStatus === "error" && exportError && (
            <span className={styles.statusErr}>✗ {exportError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
