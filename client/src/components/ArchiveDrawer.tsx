import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function noteTitle(content: string): string {
  const first = content.trim().split("\n")[0] || "UNTITLED";
  return first.length > 38
    ? first.slice(0, 38).toUpperCase() + "..."
    : first.toUpperCase();
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    })
    .toUpperCase();
}

// Minimalist muted palette for tabs, derived from previous colors
const TAB_COLORS = [
  "#E8E4DF", // Stone
  "#D6C8BE", // Warm Grey
  "#F4C2C2", // Soft Pink (Accentuating)
  "#E0DED7", // Sage
  "#F5F2ED", // Linen
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface ArchiveDrawerProps {
  archive: Note[];
  loading: boolean;
  activeNote: string | null;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ArchiveDrawer — CSS card-box, minimalist box front view.
//  Closed: shows the box with card tops peeking out + clean text label.
//  Open:   box expands, cards become a scrollable list.
// ─────────────────────────────────────────────────────────────────────────────
export default function ArchiveDrawer({
  archive,
  loading,
  activeNote,
  onLoad,
  onDelete,
}: ArchiveDrawerProps) {
  const [open, setOpen] = useState(false);

  // Layout constants
  const BOX_W = 220; // content width
  const CORNER = 2; // sharper corner radius

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: -BOX_W - 16, // fully outside the typewriter
        width: BOX_W,
        zIndex: 20,
        cursor: "default",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── OUTER BOX SHELL ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: CORNER,
          // Bottom wall (base) - clean beige to match new sidebar
          background: "#F9F7F2",
          border: "1px solid #E8E4DF",
          boxShadow: `
          0 10px 30px rgba(0,0,0,0.03),
          0 2px 8px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.7)
        `,
          overflow: "hidden", // Important for open/close animation
          maxHeight: open ? 500 : 80,
          transition:
            "max-height 320ms cubic-bezier(0.25,0.8,0.25,1), background 320ms ease",
        }}
      >
        {/* ── HEADER PLATE ── */}
        <div
          style={{
            position: "relative",
            height: 40,
            background: "linear-gradient(180deg, #EDE3D8 0%, #E2D5C5 100%)",
            borderBottom: "1px solid #C0B0A0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 15px",
            zIndex: 4,
          }}
        >
          {/* Label plate */}
          <div
            style={{
              background: "transparent",
              letterSpacing: "0.22em",
            }}
          >
            <span
              style={{
                fontFamily: "'Special Elite', serif",
                fontSize: 10,
                color: "#7A6050",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              ARCHIVE
            </span>
          </div>

          {/* Toggle button - cleaned up, no emoji */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close Box" : "Open Box"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: "rgba(80,50,20,.55)",
                display: "block",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 260ms ease",
              }}
            >
              ▼
            </span>
          </button>
        </div>

        {/* ── INNER CONTENT AREA ── */}
        <div
          style={{
            // Inner floor of the box
            background: open ? "#FFFFFF" : "transparent",
            position: "relative",
            minHeight: 0,
            transition: "background 320ms ease",
          }}
        >
          {/* ── CLOSED VIEW: minimalist card tops stack ── */}
          {!open && (
            <div
              style={{
                padding: "15px 15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              {(archive.length > 0
                ? archive.slice(0, 8)
                : Array(3).fill(null)
              ).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: "30px",
                    height: "2px",
                    background: "#E8E4DF",
                    borderRadius: "1px",
                    opacity: 1 - i * 0.1,
                  }}
                />
              ))}
            </div>
          )}

          {/* ── OPEN VIEW: scrollable card list ── */}
          {open && (
            <div style={{ animation: "drawer-in 200ms ease forwards" }}>
              <div
                className="cabinet-scroll"
                style={{
                  maxHeight: 440,
                  overflowY: "auto",
                  padding: "15px 0 10px",
                  scrollbarWidth: "none", // Hide scrollbar for minimalist look
                }}
              >
                {loading ? (
                  <StatusMessage text="LOADING DATA" />
                ) : archive.length === 0 ? (
                  <StatusMessage
                    text="EMPTY ARCHIVE"
                    sub="PRESS CTRL+S TO SAVE"
                  />
                ) : (
                  archive.map((note, idx) => (
                    <ArchiveCard
                      key={note.id}
                      note={note}
                      isActive={activeNote === note.id}
                      index={idx}
                      tabColor={TAB_COLORS[idx % TAB_COLORS.length]}
                      onLoad={onLoad}
                      onDelete={onDelete}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* end inner content */}
      </div>
      {/* end outer shell */}
    </div>
  );
}

// ─── Status Components ───────────────────────────────────────────────────────
function StatusMessage({ text, sub }: { text: string; sub?: string }) {
  return (
    <div style={{ padding: "20px 15px", textAlign: "left" }}>
      <div
        style={{
          fontFamily: "'Special Elite', serif",
          fontSize: 10,
          color: "#A09A94",
          letterSpacing: "0.06em",
        }}
      >
        {text}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Special Elite', serif",
            fontSize: 9,
            color: "#C0B9B0",
            letterSpacing: "0.06em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Archive Card ─────────────────────────────────────────────────────────────
interface CardProps {
  note: Note;
  isActive: boolean;
  index: number;
  tabColor: string;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

function ArchiveCard({
  note,
  isActive,
  index,
  tabColor,
  onLoad,
  onDelete,
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onLoad(note)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLoad(note);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        margin: `0 10px ${hovered ? 8 : 6}px`,
        borderRadius: 2,
        cursor: "pointer",
        userSelect: "none",
        animation: `card-drop 160ms ${Math.min(index * 35, 280)}ms both`,
        background: isActive ? "#FFFFFF" : hovered ? "#FBFBF7" : "transparent",
        border: isActive ? "1px solid #A09A94" : "1px solid #E8E4DF",
        boxShadow: hovered
          ? "0 3px 10px rgba(0,0,0,0.03)"
          : isActive
            ? "0 2px 8px rgba(0,0,0,0.02)"
            : "0 1px 3px rgba(0,0,0,0.01)",
        transition: "all 120ms ease",
        overflow: "hidden",
      }}
    >
      {/* Minimal vertical color strip, derived from previous colors */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: tabColor,
          opacity: isActive ? 1 : 0.4,
        }}
      />

      <div style={{ padding: "8px 10px 10px", paddingLeft: 12 }}>
        {/* Title - DARKER FOR READABILITY */}
        <div
          style={{
            fontFamily: "'Special Elite', serif",
            fontSize: 10,
            color: isActive ? "#4A4540" : "#605B56",
            letterSpacing: "0.03em",
            lineHeight: 1.4,
            marginBottom: 8,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {noteTitle(note.content)}
        </div>

        {/* Meta row - DARKER FOR READABILITY */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Special Elite', serif",
              fontSize: 8,
              color: "#A09A94",
              letterSpacing: "0.1em",
            }}
          >
            {fmtDate(note.createdAt)}
          </span>
          {hovered && (
            <button
              onClick={(e) => onDelete(note.id, e)}
              aria-label="Delete Note"
              style={{
                background: "transparent",
                border: "none",
                color: "#C0B9B0", // muted, no emoji
                fontSize: 10,
                cursor: "pointer",
                fontFamily: "'Special Elite', serif",
              }}
            >
              DELETE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
