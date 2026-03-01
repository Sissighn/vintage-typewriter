import React, { useState } from "react";
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
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 20,
        zIndex: 20,
        width: open ? 180 : 52,
        transition: "width 300ms ease",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: 340,
          borderRadius: "0 6px 6px 0",
          border: "1.5px solid #C0B0A0",
          borderLeft: "none",
          background: "linear-gradient(160deg, #F2EBE0 0%, #E8DDD0 100%)",
          boxShadow: "2px 6px 20px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "linear-gradient(180deg, #EDE3D8 0%, #E2D5C5 100%)",
            border: "none",
            borderBottom: "1.5px solid #C0B0A0",
            cursor: "pointer",
            fontFamily: "'Special Elite', monospace",
            color: "#7A6050",
          }}
        >
          {open ? "❮ PAPIER" : "📄"}
        </button>
        {open && (
          <div
            style={{
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {Object.values(PAPER_STYLES).map((style) => (
              <button
                key={style.id}
                onClick={() => onTypeChange(style.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  fontSize: "10px",
                  fontFamily: "'Special Elite', monospace",
                  background: currentType === style.id ? "#F4C2C2" : "white",
                  color: currentType === style.id ? "white" : "#7A6050",
                  border: "1px solid #C0B0A0",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <span>{style.icon}</span> {style.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
