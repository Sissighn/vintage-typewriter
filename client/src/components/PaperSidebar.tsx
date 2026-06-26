import {
  INK_STRENGTHS,
  PAPER_STYLES,
  RIBBON_COLORS,
  type InkStrength,
  type RibbonId,
} from "../config/paperStyles";
import { useEffect, useRef } from "react";
import styles from "./PaperSidebar.module.css";

interface PaperSidebarProps {
  currentType: string;
  onTypeChange: (typeId: string) => void;
  customPaperColor: string;
  onCustomPaperColorChange: (color: string) => void;
  ribbonId: RibbonId;
  onRibbonChange: (ribbonId: RibbonId) => void;
  inkStrength: InkStrength;
  onInkStrengthChange: (strength: InkStrength) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaperSidebar({
  currentType,
  onTypeChange,
  customPaperColor,
  onCustomPaperColorChange,
  ribbonId,
  onRibbonChange,
  inkStrength,
  onInkStrengthChange,
  open,
  onOpenChange,
}: PaperSidebarProps) {
  const launcherRef = useRef<HTMLButtonElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      toggleRef.current?.focus();
    }

    if (!open && wasOpenRef.current) {
      window.setTimeout(() => launcherRef.current?.focus(), 0);
    }

    wasOpenRef.current = open;
  }, [open]);

  const selectPaper = (typeId: string) => {
    onTypeChange(typeId);
    if (window.matchMedia("(max-width: 1199px)").matches) {
      onOpenChange(false);
    }
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
          aria-controls="paper-panel"
          aria-expanded="false"
        >
          PAPER
        </button>
      )}

      <aside
        id="paper-panel"
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={toggleRef}
          type="button"
          onClick={() => onOpenChange(!open)}
          className={styles.toggleButton}
          aria-controls="paper-options"
          aria-expanded={open}
        >
          {open ? "CLOSE" : "MENU"}
        </button>

        {open && (
          <div id="paper-options" className={styles.menu}>
          <p className={styles.sectionLabel}>PAPER SELECTION</p>

          {Object.values(PAPER_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => selectPaper(style.id)}
              className={`${styles.paperButton} ${
                currentType === style.id
                  ? styles.paperButtonActive
                  : styles.paperButtonInactive
              }`}
            >
              {style.name}
            </button>
          ))}

          <label className={styles.controlLabel} htmlFor="custom-paper-color">
            CUSTOM PAPER COLOR
          </label>
          <input
            id="custom-paper-color"
            className={styles.colorPicker}
            type="color"
            value={customPaperColor}
            onChange={(event) => {
              onCustomPaperColorChange(event.target.value);
              onTypeChange("custom");
            }}
            aria-label="Choose custom paper color"
          />

          <p className={styles.sectionLabel}>RIBBON</p>
          <div className={styles.optionGrid}>
            {Object.values(RIBBON_COLORS).map((ribbon) => (
              <button
                type="button"
                key={ribbon.id}
                className={`${styles.chipButton} ${
                  ribbonId === ribbon.id ? styles.chipButtonActive : ""
                }`}
                onClick={() => onRibbonChange(ribbon.id)}
              >
                <span
                  className={styles.swatch}
                  style={{ background: ribbon.color ?? "linear-gradient(135deg, #2f2a26, #f7f3e9)" }}
                />
                {ribbon.name}
              </button>
            ))}
          </div>

          <p className={styles.sectionLabel}>INK STRENGTH</p>
          <div className={styles.optionGrid}>
            {Object.values(INK_STRENGTHS).map((strength) => (
              <button
                type="button"
                key={strength.id}
                className={`${styles.chipButton} ${
                  inkStrength === strength.id ? styles.chipButtonActive : ""
                }`}
                onClick={() => onInkStrengthChange(strength.id)}
              >
                {strength.name}
              </button>
            ))}
          </div>
          </div>
        )}
      </aside>
    </>
  );
}
