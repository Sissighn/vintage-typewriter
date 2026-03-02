import { useState } from "react";
import { PAPER_STYLES } from "../config/paperStyles";
import styles from "./PaperSidebar.module.css";

interface PaperSidebarProps {
  currentType: string;
  onTypeChange: (typeId: string) => void;
}

export default function PaperSidebar({
  currentType,
  onTypeChange,
}: PaperSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}
    >
      <button onClick={() => setOpen(!open)} className={styles.toggleButton}>
        {open ? "CLOSE" : "MENU"}
      </button>

      {open && (
        <div className={styles.menu}>
          <p className={styles.sectionLabel}>PAPER SELECTION</p>

          {Object.values(PAPER_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => onTypeChange(style.id)}
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
  );
}
