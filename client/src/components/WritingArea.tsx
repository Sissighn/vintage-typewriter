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
  inputRef: React.Ref<HTMLTextAreaElement>;
  paperScrollRef: React.Ref<HTMLDivElement>;
  // Handlers
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleKeyClick: (value: string, type: "char" | "key") => void;
  saveNote: () => void;
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
  saveNote,
  focusInput,
}: WritingAreaProps) {
  return (
    <div className={styles.writingAreaContainer} onClick={focusInput}>
      {/* -- PAPER -- */}
      <div className={styles.paperContainer} onClick={focusInput}>
        <div
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
                fontSize: "clamp(9px,1.5vw,12px)",
                lineHeight: `${LINE_HEIGHT}px`,
                color:
                  paperType === "blueprint"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(190,170,155,.5)",
              }}
            >
              Type your manuscript here...
            </div>
          )}
          <textarea
            className={styles.textarea}
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_CHARS}
            aria-label="Typewriter input"
            style={{
              padding: `${PAPER_PAD_V}px 26px`,
              color: PAPER_STYLES[paperType].textColor || "#2a2020",
              fontSize: "clamp(9px,1.5vw,12px)",
              lineHeight: `${LINE_HEIGHT}px`,
              caretColor:
                paperType === "blueprint" ? "#fff" : "rgba(180,100,100,.6)",
            }}
          />
        </div>

        {/* Roller Shadow */}
        <div className={styles.rollerShadow} />
      </div>

      {/* -- TYPEWRITER ILLUSTRATION -- */}
      <div className={styles.typewriterIllustration}>
        <Typewriter
          pressedKey={pressedKey}
          onKeyClick={handleKeyClick}
          carriageReturn={carriageReturn}
        />
      </div>

      {/* -- SAVE BUTTON & STATUS -- */}
      <div
        className={styles.saveContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`${styles.saveButton} ${saving ? styles.saving : ""}`}
          onClick={saveNote}
          disabled={saving || !text.trim()}
          aria-label="Archive manuscript"
        >
          {saving ? "Archiving..." : "↑ Archive Manuscript"}
        </button>

        {saveMsg === "ok" && (
          <span className={styles.saveStatusOk}>✓ Archived</span>
        )}
        {saveMsg === "err" && (
          <span className={styles.saveStatusErr}>✗ Error</span>
        )}
      </div>
    </div>
  );
}
