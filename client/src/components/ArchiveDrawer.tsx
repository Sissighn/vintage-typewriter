import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function noteTitle(content: string): string {
  const first = content.trim().split("\n")[0] || "Untitled";
  return first.length > 38 ? first.slice(0, 38) + "…" : first;
}
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

const TAB_COLORS = [
  "#F4A0A0",
  "#A0C4F4",
  "#B8F4C0",
  "#F4D4A0",
  "#C4A0F4",
  "#F4A0D4",
  "#A0EAF4",
  "#D4F4A0",
];

// ── Wood grain CSS (repeating gradients, no images) ───────────────────────────
const WOOD_LIGHT = `
  repeating-linear-gradient(
    92deg,
    rgba(0,0,0,0)      0px,  rgba(0,0,0,0)      18px,
    rgba(0,0,0,0.025)  18px, rgba(0,0,0,0.025)  19px,
    rgba(0,0,0,0)      19px, rgba(0,0,0,0)       32px,
    rgba(255,255,255,0.04) 32px, rgba(255,255,255,0.04) 33px
  ),
  repeating-linear-gradient(
    89deg,
    rgba(0,0,0,0)      0px,  rgba(0,0,0,0)      44px,
    rgba(0,0,0,0.018)  44px, rgba(0,0,0,0.018)  46px
  ),
  linear-gradient(180deg, #E8B870 0%, #D4A055 40%, #C89040 70%, #B87D35 100%)
`;
const WOOD_DARK = `
  repeating-linear-gradient(
    92deg,
    rgba(0,0,0,0)      0px,  rgba(0,0,0,0)      18px,
    rgba(0,0,0,0.04)   18px, rgba(0,0,0,0.04)   19px,
    rgba(0,0,0,0)      19px, rgba(0,0,0,0)       32px,
    rgba(255,255,255,0.03) 32px, rgba(255,255,255,0.03) 33px
  ),
  linear-gradient(180deg, #C89040 0%, #B07030 60%, #985E22 100%)
`;
const WOOD_SIDE = `
  repeating-linear-gradient(
    0deg,
    rgba(0,0,0,0)      0px, rgba(0,0,0,0)      22px,
    rgba(0,0,0,0.03)   22px, rgba(0,0,0,0.03)  23px
  ),
  linear-gradient(90deg, #B87030 0%, #A06020 100%)
`;

// ─── Props ────────────────────────────────────────────────────────────────────
interface ArchiveDrawerProps {
  archive: Note[];
  loading: boolean;
  activeNote: string | null;
  onLoad: (note: Note) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ArchiveDrawer — CSS wood card-box, front view, cards stacked inside.
//  Closed: shows the box with card tops peeking out + "ARCHIV" brass plate.
//  Open:   box lid flips open (CSS transform), cards become a scrollable list.
// ─────────────────────────────────────────────────────────────────────────────
export default function ArchiveDrawer({
  archive,
  loading,
  activeNote,
  onLoad,
  onDelete,
}: ArchiveDrawerProps) {
  const [open, setOpen] = useState(false);

  const BOX_W = 220; // inner content width
  const WALL = 14; // wood wall thickness
  const CORNER = 10; // corner radius

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: -BOX_W - WALL * 2 - 16, // sits fully outside the typewriter
        width: BOX_W + WALL * 2,
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
          // Bottom wall (base)
          background: WOOD_DARK,
          boxShadow: `
          0 12px 40px rgba(0,0,0,0.28),
          0  4px 12px rgba(0,0,0,0.18),
          inset 0 1px 0 rgba(255,255,255,0.18)
        `,
          padding: `${WALL}px ${WALL}px 0`,
        }}
      >
        {/* ── TOP EDGE / FRONT WALL (always visible) ── */}
        {/* Left side wall */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WALL,
            bottom: 0,
            borderRadius: `${CORNER}px 0 0 ${CORNER}px`,
            background: WOOD_SIDE,
            boxShadow: "inset -2px 0 6px rgba(0,0,0,0.2)",
          }}
        />
        {/* Right side wall */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: WALL,
            bottom: 0,
            borderRadius: `0 ${CORNER}px ${CORNER}px 0`,
            background: WOOD_SIDE,
            boxShadow: "inset 2px 0 6px rgba(0,0,0,0.2)",
          }}
        />

        {/* ── TOP RIM — the front-facing top edge of the box ── */}
        <div
          style={{
            position: "relative",
            height: WALL + 4,
            background: WOOD_LIGHT,
            borderRadius: `${CORNER - 4}px ${CORNER - 4}px 0 0`,
            borderBottom: "2px solid rgba(0,0,0,0.15)",
            boxShadow: `
            inset 0 3px 6px rgba(255,255,255,0.18),
            0 2px 0 rgba(0,0,0,0.12)
          `,
            marginBottom: 0,
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
          }}
        >
          {/* Brass label plate */}
          <div
            style={{
              background: "linear-gradient(135deg, #D4AA50, #A07820, #C8A040)",
              borderRadius: 2,
              padding: "2px 10px",
              border: "1px solid #886010",
              boxShadow:
                "inset 0 1px 0 rgba(255,220,100,.4), 0 1px 3px rgba(0,0,0,.35)",
              letterSpacing: "0.22em",
            }}
          >
            <span
              style={{
                fontFamily: "'Special Elite','Courier New',monospace",
                fontSize: 8,
                color: "#FFF0C0",
                textTransform: "uppercase",
                textShadow: "0 1px 1px rgba(0,0,0,.4)",
              }}
            >
              ARCHIV
            </span>
          </div>

          {/* Toggle button */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Box schließen" : "Box öffnen"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 2px",
              lineHeight: 1,
              outline: "none",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "rgba(80,50,20,.55)",
                display: "block",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 260ms ease",
              }}
            >
              ▾
            </span>
          </button>
        </div>

        {/* ── INNER CONTENT AREA ─────────────────────────────────────────────
            Shows card tops when closed, full cards when open.
        ──────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            // Inner floor of the box
            background: `
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0)    0px, rgba(0,0,0,0)    28px,
              rgba(0,0,0,0.02) 28px, rgba(0,0,0,0.02) 29px
            ),
            linear-gradient(180deg, #D4A050 0%, #C08030 100%)
          `,
            borderRadius: `0 0 ${CORNER - 4}px ${CORNER - 4}px`,
            overflow: "hidden",
            // Animate height open/close
            maxHeight: open ? 500 : 60,
            transition: "max-height 320ms cubic-bezier(0.25,0.8,0.25,1)",
            position: "relative",
          }}
        >
          {/* Inner back wall shadow */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.18), transparent)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />

          {/* ── CLOSED VIEW: card tops peeking out of box ── */}
          {!open && (
            <div
              style={{
                padding: "8px 10px 4px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* Show up to 7 card tops — each slightly offset for depth illusion */}
              {(archive.length > 0
                ? archive.slice(0, 7)
                : Array(4).fill(null)
              ).map((note, i) => {
                const color = note
                  ? TAB_COLORS[i % TAB_COLORS.length]
                  : `rgba(230,215,195,${0.7 - i * 0.12})`;
                const isAct = note && activeNote === note.id;
                return (
                  <div
                    key={i}
                    style={{
                      height: 7,
                      borderRadius: "3px 3px 0 0",
                      background: note
                        ? `linear-gradient(90deg, ${color}EE 0%, ${color}88 60%, rgba(255,255,255,0.3) 100%)`
                        : `rgba(240,228,210,${0.8 - i * 0.1})`,
                      border: `1px solid ${note ? color + "AA" : "rgba(200,180,155,.4)"}`,
                      borderBottom: "none",
                      boxShadow: isAct
                        ? `0 -1px 6px ${color}66, inset 0 1px 0 rgba(255,255,255,.5)`
                        : "inset 0 1px 0 rgba(255,255,255,.35)",
                      transform: `translateX(${(i % 2 === 0 ? 1 : -1) * 0.5}px)`,
                    }}
                  />
                );
              })}
              {archive.length > 7 && (
                <div
                  style={{
                    fontFamily: "'Special Elite','Courier New',monospace",
                    fontSize: 8,
                    color: "rgba(100,70,40,.5)",
                    letterSpacing: "0.1em",
                    textAlign: "center",
                    paddingTop: 2,
                  }}
                >
                  +{archive.length - 7} mehr
                </div>
              )}
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
                  padding: "8px 0 6px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(180,140,80,.4) transparent",
                }}
              >
                {loading ? (
                  <EmptyState text="Lade…" sub="" />
                ) : archive.length === 0 ? (
                  <EmptyState
                    text="Noch nichts archiviert."
                    sub="Strg+S oder ↑ Archivieren"
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

              {/* Box bottom inner edge */}
              <div
                style={{
                  height: 8,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,.12), rgba(0,0,0,.06))",
                  borderTop: "1px solid rgba(0,0,0,.1)",
                }}
              />
            </div>
          )}
        </div>
        {/* end inner content */}

        {/* ── BOTTOM BASE — thick wood base plate ── */}
        <div
          style={{
            height: WALL + 2,
            background: WOOD_DARK,
            borderRadius: `0 0 ${CORNER}px ${CORNER}px`,
            borderTop: "2px solid rgba(0,0,0,.2)",
            boxShadow: "inset 0 -2px 4px rgba(255,255,255,.06)",
          }}
        />
      </div>
      {/* end outer shell */}

      {/* ── FLOOR SHADOW ── */}
      <div
        style={{
          margin: "0 8%",
          height: 6,
          borderRadius: "0 0 50% 50%",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.18), transparent 70%)",
        }}
      />
    </div>
  );
}

// ─── Empty / Loading State ────────────────────────────────────────────────────
function EmptyState({ text, sub }: { text: string; sub: string }) {
  return (
    <div style={{ padding: "14px 14px 10px" }}>
      <div
        style={{
          fontFamily: "'Special Elite','Courier New',monospace",
          fontSize: 10,
          color: "rgba(200,175,130,.8)",
          letterSpacing: "0.06em",
          lineHeight: 1.65,
        }}
      >
        {text}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 5,
            fontFamily: "'Special Elite','Courier New',monospace",
            fontSize: 8,
            color: "rgba(200,175,130,.5)",
            letterSpacing: "0.06em",
            lineHeight: 1.6,
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
        margin: `0 10px ${hovered ? 6 : 4}px`,
        borderRadius: 3,
        cursor: "pointer",
        userSelect: "none",
        animation: `card-drop 160ms ${Math.min(index * 35, 280)}ms both`,
        background: isActive
          ? "linear-gradient(170deg,#FFF8F0,#FFF2E8)"
          : hovered
            ? "linear-gradient(170deg,#FFFDF8,#FFF9F2)"
            : "linear-gradient(170deg,#FEFAF4,#F8F4EC)",
        border: `1px solid ${isActive ? "rgba(244,160,160,.5)" : "rgba(180,165,145,.4)"}`,
        boxShadow: hovered
          ? "0 3px 10px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.9)"
          : isActive
            ? "0 2px 8px rgba(244,160,160,.15), inset 0 1px 0 rgba(255,255,255,.8)"
            : "0 1px 3px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.8)",
        transition: "all 120ms ease",
        overflow: "hidden",
      }}
    >
      {/* Colored tab strip */}
      <div
        style={{
          height: 4,
          background: isActive
            ? `linear-gradient(90deg, ${tabColor}, ${tabColor}BB)`
            : `linear-gradient(90deg, ${tabColor}99, ${tabColor}44)`,
          transition: "background 120ms ease",
        }}
      />

      {/* Ruled-line texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          top: 4,
          backgroundImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 13px, rgba(180,165,145,.09) 13px, rgba(180,165,145,.09) 14px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ padding: "7px 10px 8px", position: "relative" }}>
        {/* Color dot */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: hovered ? 22 : 8,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: tabColor,
            opacity: isActive ? 1 : 0.45,
            boxShadow: `0 0 5px ${tabColor}88`,
            transition: "right 120ms ease",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontFamily: "'Special Elite','Courier New',monospace",
            fontSize: 10,
            fontWeight: 700,
            color: isActive ? "#A85858" : hovered ? "#6A5048" : "#7A6050",
            letterSpacing: "0.03em",
            lineHeight: 1.35,
            paddingRight: 16,
            marginBottom: 5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
          }}
        >
          {note.title || noteTitle(note.content)}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Special Elite','Courier New',monospace",
              fontSize: 8,
              color: "rgba(120,100,85,.5)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {fmtDate(note.createdAt)}
          </span>
          <span
            style={{
              fontFamily: "'Special Elite','Courier New',monospace",
              fontSize: 7,
              color: "rgba(120,100,85,.35)",
              letterSpacing: "0.06em",
            }}
          >
            {note.content.length}z
          </span>
        </div>
      </div>

      {/* Delete button */}
      {hovered && (
        <button
          onClick={(e) => onDelete(note.id, e)}
          aria-label="Notiz löschen"
          style={{
            position: "absolute",
            top: 8,
            right: 7,
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: "rgba(200,140,140,.18)",
            border: "1px solid rgba(200,140,140,.35)",
            color: "rgba(180,90,90,.7)",
            fontSize: 9,
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
