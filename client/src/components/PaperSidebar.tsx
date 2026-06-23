import { PAPER_STYLES } from "../config/paperStyles";
import styles from "./PaperSidebar.module.css";

interface PaperSidebarProps {
  currentType: string;
  onTypeChange: (typeId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaperSidebar({
  currentType,
  onTypeChange,
  open,
  onOpenChange,
}: PaperSidebarProps) {
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
          </div>
        )}
      </aside>
    </>
  );
}
