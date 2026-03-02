import React from "react";
import Typewriter from "./Typewriter";
import styles from "./WritingArea.module.css";
import { PAPER_STYLES } from "../config/paperStyles";
import {
  MAX_CHARS,
  LINE_HEIGHT,
  PAPER_H,
  PAPER_PAD_V,
} from "../config/editorConfig";

interface WritingAreaProps {
  // State
  text: string;
  paperType: string;
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
  onExport: () => void; // New handler for image export
  focusInput: () => void;
}

export default function WritingArea({
  text,
  paperType,
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
  focusInput,
}: WritingAreaProps) {
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
            background: PAPER_STYLES[paperType].background,
            backgroundSize: PAPER_STYLES[paperType].backgroundSize || "auto",
          }}
        >
          {text.length === 0 && (
            <div
              className={styles.placeholder}
              style={{
                top: `${PAPER_PAD_V}px`,
                color:
                  paperType === "blueprint"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(160,154,148,0.5)",
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
              color: PAPER_STYLES[paperType].textColor || "#4A4540",
              caretColor: paperType === "blueprint" ? "#fff" : "#4A4540",
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
            disabled={!text.trim()}
          >
            Download Image
          </button>
        </div>

        {/* Status Indicators */}
        <div className={styles.statusContainer}>
          {saveMsg === "ok" && <span className={styles.statusOk}>✓ Saved</span>}
          {saveMsg === "err" && (
            <span className={styles.statusErr}>✗ Error</span>
          )}
        </div>
      </div>
    </div>
  );
}
