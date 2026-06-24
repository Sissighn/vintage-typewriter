import React from "react";
import Typewriter from "./Typewriter";
import styles from "./WritingArea.module.css";
import type { ExportFormat, PaperSize } from "../utils/exportManuscript";
import type { InkStrength, PaperStyle } from "../config/paperStyles";
import { INK_STRENGTHS } from "../config/paperStyles";
import { MAX_CHARS, PAPER_H, PAPER_PAD_V } from "../config/editorConfig";

interface WritingAreaProps {
  // State
  text: string;
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
  saveMsg: "ok" | "err" | null;
  // Refs
  inputRef: React.RefObject<HTMLTextAreaElement>;
  paperScrollRef: React.RefObject<HTMLDivElement>;
  // Handlers
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleKeyClick: (value: string, type: "char" | "key") => void;
  onSave: () => void;
  onExport: () => void;
  onPrint: () => void;
  onExportFormatChange: (format: ExportFormat) => void;
  onPaperSizeChange: (paperSize: PaperSize) => void;
  focusInput: () => void;
}

export default function WritingArea({
  text,
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
  saveMsg,
  inputRef,
  paperScrollRef,
  handleTextChange,
  handleKeyDown,
  handleKeyClick,
  onSave,
  onExport,
  onPrint,
  onExportFormatChange,
  onPaperSizeChange,
  focusInput,
}: WritingAreaProps) {
  const ink = INK_STRENGTHS[inkStrength];

  return (
    <div className={styles.writingAreaContainer} onClick={focusInput}>
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
            className={`${styles.actionButton} ${styles.primaryButton} ${saving ? styles.saving : ""}`}
            onClick={onSave}
            disabled={saving || !text.trim()}
          >
            {saving ? "Archiving..." : "Add to Archive"}
          </button>

          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onExport}
            disabled={!text.trim() || exportStatus === "working"}
          >
            {exportStatus === "working" ? "Exporting..." : "Export"}
          </button>

          <button
            className={`${styles.actionButton} ${styles.secondaryButton}`}
            onClick={onPrint}
            disabled={!text.trim() || exportStatus === "working"}
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

        {/* Status Indicators */}
        <div className={styles.statusContainer}>
          {saveMsg === "ok" && <span className={styles.statusOk}>✓ Saved</span>}
          {saveMsg === "err" && (
            <span className={styles.statusErr}>✗ Error</span>
          )}
          {exportStatus === "error" && exportError && (
            <span className={styles.statusErr}>✗ {exportError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
