import React, { useState, useRef, useEffect, useCallback } from "react";
import Typewriter from "./components/Typewriter";
import ArchiveDrawer from "./components/ArchiveDrawer";
import type { Note } from "./components/ArchiveDrawer";
import { useTypewriterSound } from "./hooks/useTypewriterSound";

const MAX_CHARS = 2000;
const LINE_HEIGHT = 23;
const PAPER_VISIBLE_LINES = 8;
const PAPER_PAD_V = 22;
const PAPER_H = PAPER_VISIBLE_LINES * LINE_HEIGHT + PAPER_PAD_V * 2;

export default function App() {
  const { playKeySound } = useTypewriterSound();

  // ── Typewriter state ───────────────────────────────────────────────────────
  const [text, setText] = useState("");
  const [pressedKey, setPressedKey] = useState("");
  const [carriageReturn, setCarriageReturn] = useState(0);

  // ── Archive state ──────────────────────────────────────────────────────────
  const [archive, setArchive] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "err" | null>(null);

  const paperScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data: Note[]) => {
        setArchive(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Paper auto-scroll ──────────────────────────────────────────────────────
  const autoScrollPaper = useCallback(() => {
    const el = paperScrollRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) return;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 260);
  }, []);
  useEffect(() => {
    autoScrollPaper();
  }, [text, autoScrollPaper]);

  // ── Key flash ──────────────────────────────────────────────────────────────
  const flashKey = useCallback((k: string) => {
    setPressedKey(k);
    setTimeout(() => setPressedKey(""), 120);
  }, []);

  // ── Save note ──────────────────────────────────────────────────────────────
  const saveNote = useCallback(async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      const saved: Note = await res.json();
      setArchive((prev) => [saved, ...prev]);
      setSaveMsg("ok");
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg("err");
      setTimeout(() => setSaveMsg(null), 2500);
    } finally {
      setSaving(false);
    }
  }, [text, saving]);

  // ── Keyboard input ─────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      if (e.key === "Backspace") {
        setText((t) => t.slice(0, -1));
        flashKey("Backspace");
        playKeySound("Backspace");
        return;
      }
      if (e.key === "Enter") {
        if (text.length >= MAX_CHARS) return;
        setText((t) => t + "\n");
        setCarriageReturn((n) => n + 1);
        flashKey("Enter");
        playKeySound("Enter");
        return;
      }
      if (e.key === "Tab") {
        setText((t) => (t.length + 4 <= MAX_CHARS ? t + "    " : t));
        flashKey("Tab");
        playKeySound("Tab");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        saveNote();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setText((t) => (t.length < MAX_CHARS ? t + e.key : t));
        flashKey(e.key.toUpperCase());
        playKeySound(e.key);
      }
    },
    [text, flashKey, saveNote, playKeySound],
  );

  // ── Screen-key clicks ──────────────────────────────────────────────────────
  const handleKeyClick = useCallback(
    (value: string, type: "char" | "key") => {
      if (type === "char") {
        setText((t) => (t.length < MAX_CHARS ? t + value : t));
        flashKey(value === " " ? " " : value.toUpperCase());
        playKeySound(value);
      } else {
        if (value === "Backspace") {
          setText((t) => t.slice(0, -1));
          flashKey("Backspace");
          playKeySound("Backspace");
        } else if (value === "Enter") {
          setText((t) => (t.length < MAX_CHARS ? t + "\n" : t));
          setCarriageReturn((n) => n + 1);
          flashKey("Enter");
          playKeySound("Enter");
        } else if (value === "Tab") {
          setText((t) => (t.length + 4 <= MAX_CHARS ? t + "    " : t));
          flashKey("Tab");
          playKeySound("Tab");
        }
      }
      inputRef.current?.focus();
    },
    [flashKey, playKeySound],
  );

  // ── Archive handlers ───────────────────────────────────────────────────────
  const loadNote = useCallback((note: Note) => {
    setText(note.content);
    setActiveNote(note.id);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const deleteNote = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await fetch(`/api/notes/${id}`, { method: "DELETE" });
        setArchive((prev) => prev.filter((n) => n.id !== id));
        if (activeNote === id) setActiveNote(null);
      } catch {}
    },
    [activeNote],
  );

  const focusInput = () => inputRef.current?.focus();

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden overflow-y-auto selection:bg-pink-200"
      style={{ background: "#FAF7F2" }}
      onClick={focusInput}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
        @keyframes tw-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes drawer-in       { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:none} }
        @keyframes card-drop       { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes save-pulse      { 0%,100%{opacity:1} 50%{opacity:.45} }
        .paper-scroll::-webkit-scrollbar   { display:none; }
        .cabinet-scroll::-webkit-scrollbar { width:4px; }
        .cabinet-scroll::-webkit-scrollbar-track { background:rgba(180,155,135,.08); border-radius:2px; }
        .cabinet-scroll::-webkit-scrollbar-thumb { background:rgba(180,155,135,.4); border-radius:2px; }
        @media (prefers-reduced-motion:reduce) {
          [style*="tw-cursor-blink"],[style*="save-pulse"] { animation:none!important;opacity:1!important; }
        }
      `}</style>

      {/* Hidden textarea */}
      <textarea
        ref={inputRef}
        aria-label="Type your text here"
        onKeyDown={handleKeyDown}
        readOnly
        style={{
          position: "fixed",
          opacity: 0,
          pointerEvents: "none",
          width: 1,
          height: 1,
          top: 0,
          left: 0,
        }}
      />

      {/* ── HEADER ── */}
      <header style={{ marginBottom: 28, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Special Elite','Courier New',monospace",
            fontSize: "clamp(22px,4vw,38px)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#F4A0A0",
            margin: 0,
            lineHeight: 1,
          }}
        >
          Vintage Typewriter
        </h1>
        <p
          style={{
            fontFamily: "'Special Elite','Courier New',monospace",
            fontSize: "clamp(8px,1.1vw,10px)",
            color: "rgba(180,155,140,.65)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            margin: "6px 0 0",
          }}
        >
          Mechanical Typing Station // 2026
        </p>
      </header>

      {/* ── STAGE: typewriter centered, drawer floats absolute to the right ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 780,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* ── TYPEWRITER COLUMN ── */}
        <div
          className="relative w-full flex flex-col items-center"
          style={{ maxWidth: 780 }}
          onClick={focusInput}
        >
          {/* ── PAPER ── */}
          <div
            onClick={focusInput}
            style={{
              position: "relative",
              zIndex: 10,
              width: "58%",
              marginBottom: -16,
              cursor: "text",
            }}
          >
            <div
              ref={paperScrollRef}
              className="paper-scroll"
              style={{
                position: "relative",
                height: PAPER_H,
                borderRadius: "3px 3px 0 0",
                overflow: "auto",
                border: "1px solid rgba(0,0,0,.06)",
                borderBottom: "none",
                background: `
                repeating-linear-gradient(135deg,rgba(200,185,165,.045) 0px,rgba(200,185,165,.045) 1px,transparent 1px,transparent 9px),
                repeating-linear-gradient(45deg, rgba(190,175,155,.03)  0px,rgba(190,175,155,.03)  1px,transparent 1px,transparent 12px),
                repeating-linear-gradient(90deg, rgba(210,200,185,.025) 0px,rgba(210,200,185,.025) 1px,transparent 1px,transparent 18px),
                linear-gradient(160deg,#FFFEF9 0%,#FAF8F2 45%,#F4F0E6 100%)
              `,
                boxShadow:
                  "0 6px 30px rgba(0,0,0,.09),0 1px 4px rgba(0,0,0,.05),inset 0 0 0 1px rgba(255,255,255,.75),inset 0 6px 14px rgba(0,0,0,.04)",
                scrollbarWidth: "none",
              }}
            >
              <div style={{ padding: `${PAPER_PAD_V}px 26px` }}>
                {text.length === 0 ? (
                  <div
                    style={{
                      fontFamily: "'Special Elite','Courier New',monospace",
                      fontSize: "clamp(9px,1.5vw,12px)",
                      lineHeight: `${LINE_HEIGHT}px`,
                      color: "rgba(190,170,155,.5)",
                      fontStyle: "italic",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    Type here…
                  </div>
                ) : (
                  <div
                    style={{
                      fontFamily: "'Special Elite','Courier New',monospace",
                      fontSize: "clamp(9px,1.5vw,12px)",
                      lineHeight: `${LINE_HEIGHT}px`,
                      color: "#2a2020",
                      letterSpacing: "0.04em",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {text}
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: "1em",
                        background: "rgba(180,100,100,.6)",
                        marginLeft: 1,
                        verticalAlign: "text-bottom",
                        animation: "tw-cursor-blink 1s step-end infinite",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Overlay shadows */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 22,
                background:
                  "linear-gradient(180deg,rgba(0,0,0,.08),transparent)",
                pointerEvents: "none",
                borderRadius: "3px 3px 0 0",
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 14,
                background:
                  "linear-gradient(90deg,rgba(0,0,0,.04),transparent)",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 14,
                background:
                  "linear-gradient(270deg,rgba(0,0,0,.03),transparent)",
                pointerEvents: "none",
                zIndex: 4,
              }}
            />
          </div>

          {/* ── TYPEWRITER ILLUSTRATION ── */}
          <div style={{ position: "relative", zIndex: 0, width: "100%" }}>
            <Typewriter
              pressedKey={pressedKey}
              onKeyClick={handleKeyClick}
              carriageReturn={carriageReturn}
            />
          </div>

          {/* ── SAVE BUTTON ── */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={saveNote}
              disabled={saving || !text.trim()}
              aria-label="Notiz archivieren (Strg+S)"
              style={{
                fontFamily: "'Special Elite','Courier New',monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: saving ? "rgba(180,155,140,.5)" : "#F4A0A0",
                background: "transparent",
                border: `1.5px solid ${saving ? "rgba(244,160,160,.2)" : "rgba(244,160,160,.4)"}`,
                borderRadius: 4,
                padding: "6px 18px",
                cursor: saving || !text.trim() ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
                animation: saving
                  ? "save-pulse 0.8s ease-in-out infinite"
                  : "none",
              }}
            >
              {saving ? "Speichern…" : "↑ Archivieren"}
            </button>

            {saveMsg === "ok" && (
              <span
                style={{
                  fontFamily: "'Special Elite','Courier New',monospace",
                  fontSize: 10,
                  color: "#A8C8A0",
                  letterSpacing: "0.15em",
                }}
              >
                ✓ Gespeichert
              </span>
            )}
            {saveMsg === "err" && (
              <span
                style={{
                  fontFamily: "'Special Elite','Courier New',monospace",
                  fontSize: 10,
                  color: "#C8A0A0",
                  letterSpacing: "0.15em",
                }}
              >
                ✗ Fehler
              </span>
            )}
          </div>
        </div>
        {/* end typewriter column */}

        {/* ── ARCHIVE DRAWER — absolute, floats right of the typewriter, never overlaps ── */}
        <ArchiveDrawer
          archive={archive}
          loading={loading}
          activeNote={activeNote}
          onLoad={loadNote}
          onDelete={deleteNote}
        />
      </div>
      {/* end stage */}
    </div>
  );
}
