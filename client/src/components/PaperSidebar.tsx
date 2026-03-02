// File: client/src/components/PaperSidebar.tsx
import { useState } from "react";
import { PAPER_STYLES } from "../config/paperStyles";

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
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: open ? 220 : 60,
        transition: "width 400ms cubic-bezier(0.2, 0, 0, 1)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        background: "#F9F7F2",
        borderRight: "1px solid #E8E4DF",
        boxShadow: open ? "10px 0 30px rgba(0,0,0,0.02)" : "none",
      }}
    >
      {/* Menu Toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "40px 0",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid #E8E4DF",
          cursor: "pointer",
          fontFamily: "'Special Elite', serif",
          fontSize: "10px",
          letterSpacing: "0.3em",
          color: "#A09A94",
          textAlign: "center",
        }}
      >
        {open ? "CLOSE" : "MENU"}
      </button>

      {open && (
        <div
          style={{
            padding: "30px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            animation: "drawer-in 0.4s ease-out",
          }}
        >
          <p
            style={{
              fontFamily: "'Special Elite', serif",
              fontSize: "9px",
              color: "#C0B9B0",
              letterSpacing: "0.2em",
              marginBottom: "10px",
            }}
          >
            PAPER SELECTION
          </p>

          {Object.values(PAPER_STYLES).map((style) => (
            <button
              key={style.id}
              onClick={() => onTypeChange(style.id)}
              style={{
                padding: "12px 0",
                fontSize: "11px",
                fontFamily: "'Special Elite', serif",
                background: "transparent",
                color: currentType === style.id ? "#605B56" : "#A09A94",
                border: "none",
                borderBottom:
                  currentType === style.id
                    ? "1px solid #605B56"
                    : "1px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
                opacity: currentType === style.id ? 1 : 0.6,
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
