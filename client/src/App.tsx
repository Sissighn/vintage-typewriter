import React, { useState, useRef, useEffect, useCallback } from "react";
import Typewriter from "./components/Typewriter";
import ArchiveDrawer from "./components/ArchiveDrawer";
import type { Note } from "./components/ArchiveDrawer";
import { useTypewriterSound } from "./hooks/useTypewriterSound";
import PaperSidebar from "./components/PaperSidebar";
import { PAPER_STYLES } from "./config/paperStyles";

const MAX_CHARS = 2000;
const LINE_HEIGHT = 23;
const PAPER_VISIBLE_LINES = 8;
const PAPER_PAD_V = 22;
const PAPER_H = PAPER_VISIBLE_LINES * LINE_HEIGHT + PAPER_PAD_V * 2;

// Nutze Port 5001, um den AirPlay-Konflikt auf dem Mac zu vermeiden
const API_URL = "http://localhost:5001/api/notes";

export default function App() {
  const { playKeySound } = useTypewriterSound();

  // ── HOOKS (Müssen immer am Anfang der Funktion stehen!) ──────────
  const [text, setText] = useState("");
  const [pressedKey, setPressedKey] = useState("");
  const [carriageReturn, setCarriageReturn] = useState(0);
  const [paperType, setPaperType] = useState<string>("classic");

  const [archive, setArchive] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"ok" | "err" | null>(null);

  const paperScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── INIT ──────────────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();

    // Notizen vom Backend laden
    fetch(API_URL)
      .then((r) => r.json())
      .then((data: Note[]) => {
        setArchive(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ── Papier auto-scroll ───────────────────────────────────────────
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

  // Textarea Höhe an Inhalt anpassen
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  // ── Key flash ────────────────────────────────────────────────────
  const flashKey = useCallback((k: string) => {
    setPressedKey(k);
    setTimeout(() => setPressedKey(""), 120);
  }, []);

  // ── Save note ────────────────────────────────────────────────────
  const saveNote = useCallback(async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          title: "Manuskript_" + new Date().toLocaleTimeString(),
        }),
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

  // ── Textarea Change Handler ──────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Die Längenprüfung erfolgt hier, um auch das Einfügen (Paste) abzufangen
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
    }
  };

  // ── Keyboard input ───────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Backspace") {
        flashKey("Backspace");
        playKeySound("Backspace");
        return;
      }
      if (e.key === "Enter") {
        setCarriageReturn((n) => n + 1);
        flashKey("Enter");
        playKeySound("Enter");
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault(); // Verhindert Fokuswechsel
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const newText = text.substring(0, start) + "    " + text.substring(end);

        if (newText.length <= MAX_CHARS) {
          setText(newText);
          // Cursor nach den eingefügten Leerzeichen positionieren
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 4;
          }, 0);
        }
        flashKey("Tab");
        playKeySound("Tab");
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); // Verhindert das Speichern der Seite im Browser
        saveNote();
        return;
      }

      // Standard-Tastenkombinationen (copy, paste, cut, select all) durchlassen
      if (
        (e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x"].includes(e.key.toLowerCase())
      ) {
        return; // Browser die Aktion ausführen lassen
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        if (text.length < MAX_CHARS) {
          flashKey(e.key.toUpperCase());
          playKeySound(e.key);
        } else {
          e.preventDefault(); // Verhindert weitere Eingabe
        }
      }
    },
    [text, flashKey, saveNote, playKeySound],
  );

  // ── Screen-key clicks ────────────────────────────────────────────
  const handleKeyClick = useCallback(
    (value: string, type: "char" | "key") => {
      const textarea = inputRef.current;
      if (!textarea) return;

      textarea.focus();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      let newText = text;
      let newCursorPos = start;

      if (type === "char") {
        newText = text.substring(0, start) + value + text.substring(end);
        newCursorPos = start + value.length;
        flashKey(value === " " ? " " : value.toUpperCase());
        playKeySound(value);
      } else {
        if (value === "Backspace") {
          if (start === end && start > 0) {
            newText = text.substring(0, start - 1) + text.substring(end);
            newCursorPos = start - 1;
          } else if (start !== end) {
            newText = text.substring(0, start) + text.substring(end);
            newCursorPos = start;
          }
          flashKey("Backspace");
          playKeySound("Backspace");
        } else if (value === "Enter") {
          newText = text.substring(0, start) + "\n" + text.substring(end);
          newCursorPos = start + 1;
          setCarriageReturn((n) => n + 1);
          flashKey("Enter");
          playKeySound("Enter");
        } else if (value === "Tab") {
          newText = text.substring(0, start) + "    " + text.substring(end);
          newCursorPos = start + 4;
          flashKey("Tab");
          playKeySound("Tab");
        }
      }

      if (newText.length <= MAX_CHARS) {
        setText(newText);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      }
    },
    [text, flashKey, playKeySound],
  );

  // ── Archive handlers ─────────────────────────────────────────────
  const loadNote = useCallback((note: Note) => {
    setText(note.content);
    setActiveNote(note.id);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const deleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Verhindert, dass die Notiz gleichzeitig geladen wird

    if (!window.confirm("Are you sure you want to destroy this manuscript?"))
      return;

    try {
      // WICHTIG: Port 5001 nutzen
      const response = await fetch(`http://localhost:5001/api/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Notiz aus dem lokalen Speicher (State) entfernen
        setArchive((prev) => prev.filter((n) => n.id !== id));

        // Falls die gelöschte Notiz gerade auf dem Papier liegt, das Papier leeren
        if (activeNote === id) {
          setText("");
          setActiveNote(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete from archive:", error);
    }
  };

  const focusInput = () => inputRef.current?.focus();

  // ─── RENDER ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden overflow-y-auto selection:bg-pink-200"
      style={{ background: "#FAF7F2" }}
      onClick={focusInput}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
        @keyframes drawer-in       { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:none} }
        @keyframes card-drop       { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
        @keyframes save-pulse      { 0%,100%{opacity:1} 50%{opacity:.45} }
        .paper-scroll::-webkit-scrollbar   { display:none; }
        .cabinet-scroll::-webkit-scrollbar { width:4px; }
        .cabinet-scroll::-webkit-scrollbar-track { background:rgba(180,155,135,.08); border-radius:2px; }
        .cabinet-scroll::-webkit-scrollbar-thumb { background:rgba(180,155,135,.4); border-radius:2px; }
        @media (prefers-reduced-motion:reduce) {
          [style*="save-pulse"] { animation:none!important;opacity:1!important; }
        }
      `}</style>

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

      {/* ── HAUPT-LAYOUT (Sidebars + Schreibmaschine) ── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          maxWidth: 1250,
          gap: 0,
        }}
      >
        {/* LINKS: Papier-Konfigurator Sidebar */}
        <PaperSidebar
          currentType={paperType}
          onTypeChange={(id) => setPaperType(id)}
        />

        {/* MITTE: Schreibmaschine */}
        <div
          className="relative w-full flex flex-col items-center"
          style={{ maxWidth: 780, flex: "1 1 auto" }}
          onClick={focusInput}
        >
          {/* ── PAPIER ── */}
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
                /* DYNAMISCHES DESIGN BASIEREND AUF AUSWAHL */
                background: PAPER_STYLES[paperType].background,
                backgroundSize:
                  PAPER_STYLES[paperType].backgroundSize || "auto",
                boxShadow:
                  "0 6px 30px rgba(0,0,0,.09),0 1px 4px rgba(0,0,0,.05),inset 0 0 0 1px rgba(255,255,255,.75),inset 0 6px 14px rgba(0,0,0,.04)",
                scrollbarWidth: "none",
              }}
            >
              {text.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: `${PAPER_PAD_V}px`,
                    left: "26px",
                    right: "26px",
                    fontFamily: "'Special Elite','Courier New',monospace",
                    fontSize: "clamp(9px,1.5vw,12px)",
                    lineHeight: `${LINE_HEIGHT}px`,
                    color:
                      paperType === "blueprint"
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(190,170,155,.5)",
                    fontStyle: "italic",
                    pointerEvents: "none",
                    userSelect: "none",
                    padding: `0 2px`, // Match textarea padding/border
                  }}
                >
                  Tippe hier dein Manuskript…
                </div>
              )}
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                maxLength={MAX_CHARS}
                aria-label="Schreibmaschinen-Eingabe"
                style={{
                  width: "100%",
                  minHeight: "100%",
                  padding: `${PAPER_PAD_V}px 26px`,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  color: PAPER_STYLES[paperType].textColor || "#2a2020",
                  fontFamily: "'Special Elite','Courier New',monospace",
                  fontSize: "clamp(9px,1.5vw,12px)",
                  lineHeight: `${LINE_HEIGHT}px`,
                  letterSpacing: "0.04em",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowY: "hidden", // Wir wollen, dass das Elternelement scrollt
                  caretColor:
                    paperType === "blueprint" ? "#fff" : "rgba(180,100,100,.6)",
                }}
              />
            </div>

            {/* Walzen-Schatten */}
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
          </div>

          {/* ── SCHREIBMASCHINEN ILLUSTRATION ── */}
          <div style={{ position: "relative", zIndex: 0, width: "100%" }}>
            <Typewriter
              pressedKey={pressedKey}
              onKeyClick={handleKeyClick}
              carriageReturn={carriageReturn}
            />
          </div>

          {/* ── SPEICHER-BUTTON & STATUS ── */}
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
              aria-label="Manuskript archivieren"
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
              {saving ? "Archiviere…" : "↑ In den Karteikasten"}
            </button>

            {saveMsg === "ok" && (
              <span
                style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: 10,
                  color: "#A8C8A0",
                }}
              >
                ✓ Archiviert
              </span>
            )}
            {saveMsg === "err" && (
              <span
                style={{
                  fontFamily: "'Special Elite', monospace",
                  fontSize: 10,
                  color: "#C8A0A0",
                }}
              >
                ✗ Fehler
              </span>
            )}
          </div>
        </div>

        {/* RECHTS: Karteikasten (Archiv) */}
        <ArchiveDrawer
          archive={archive}
          loading={loading}
          activeNote={activeNote}
          onLoad={loadNote}
          onDelete={deleteNote}
        />
      </div>
    </div>
  );
}
