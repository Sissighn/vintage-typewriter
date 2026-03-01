import React, { useState } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function noteTitle(content: string): string {
  const first = content.trim().split("\n")[0] || "UNTITLED";
  return first.length > 30
    ? first.slice(0, 30).toUpperCase() + "..."
    : first.toUpperCase();
}

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-US", { day: "2-digit", month: "short" })
    .toUpperCase();
}

const TAB_COLORS = ["#E8E4DF", "#D6C8BE", "#F4C2C2", "#E0DED7", "#F5F2ED"];

interface ArchiveDrawerProps {
  archive: Note[];
  loading: boolean;
  activeNote: string | null;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function ArchiveDrawer({
  archive,
  loading,
  activeNote,
  onLoad,
  onDelete,
}: ArchiveDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "relative", // Verhindert das "Abschneiden" am Bildschirmrand
        width: open ? 240 : 60,
        height: "400px",
        transition: "width 400ms cubic-bezier(0.2, 0, 0, 1)",
        marginLeft: 20,
        flexShrink: 0,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── MINIMALIST CARD BOX ── */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F9F7F2",
          border: "1px solid #E8E4DF",
          borderRadius: "2px",
          display: "flex",
          flexDirection: "column",
          boxShadow: open ? "0 15px 40px rgba(0,0,0,0.05)" : "none",
          overflow: "hidden",
        }}
      >
        {/* Box Top / Toggle */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            height: 60,
            width: "100%",
            background: "#F2EEE9",
            border: "none",
            borderBottom: "1px solid #E8E4DF",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'Special Elite', serif",
              fontSize: "10px",
              letterSpacing: "0.3em",
              color: "#5D5750",
              fontWeight: "bold",
            }}
          >
            {open ? "CLOSE" : "ARCHIVE"}
          </span>
          <span
            style={{
              fontSize: "8px",
              color: "#A09A94",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.3s",
            }}
          >
            ▼
          </span>
        </button>

        {/* Inner Content (The Cards) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {open ? (
            <div
              className="cabinet-scroll"
              style={{
                height: "100%",
                overflowY: "auto",
                padding: "15px 10px",
                animation: "drawer-in 0.4s ease-out",
              }}
            >
              {archive.length === 0 ? (
                <p
                  style={{
                    fontFamily: "'Special Elite', serif",
                    fontSize: "9px",
                    color: "#8A847E",
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  NO MANUSCRIPTS FOUND
                </p>
              ) : (
                archive.map((note, idx) => (
                  <div
                    key={note.id}
                    onClick={() => onLoad(note)}
                    style={{
                      padding: "12px",
                      marginBottom: "10px",
                      background:
                        activeNote === note.id ? "#FFFFFF" : "transparent",
                      border:
                        activeNote === note.id
                          ? "1px solid #5D5750"
                          : "1px solid #EDEAE4",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: TAB_COLORS[idx % TAB_COLORS.length],
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'Special Elite', serif",
                        fontSize: "10px",
                        color: "#3D3834",
                        marginBottom: 6,
                        fontWeight: "bold",
                      }}
                    >
                      {noteTitle(note.content)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "8px",
                          color: "#8A847E",
                          fontFamily: "'Special Elite', serif",
                        }}
                      >
                        {fmtDate(note.createdAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(note.id, e);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#D4A5A5",
                          fontSize: "8px",
                          cursor: "pointer",
                          fontFamily: "'Special Elite', serif",
                        }}
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Closed State: Minimalist stacked card edges */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                paddingTop: 20,
              }}
            >
              {Array.from({ length: Math.min(archive.length || 3, 6) }).map(
                (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "30px",
                      height: "1px",
                      background: "#D6C8BE",
                      opacity: 1 - i * 0.15,
                    }}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
