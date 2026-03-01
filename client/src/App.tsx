import React, { useState, useRef, useEffect, useCallback } from "react";
import Typewriter from "./components/Typewriter";

const MAX_CHARS = 2000;
const LINE_HEIGHT = 23; // px — must match CSS line-height below
const PAPER_VISIBLE_LINES = 8; // how many lines fit in the visible paper window

function App() {
  const [text, setText] = useState("");
  const [pressedKey, setPressedKey] = useState("");
  const [carriageReturn, setCarriageReturn] = useState(0);

  // scrollTop of the paper scroll container (controlled by user scroll OR auto-scroll)
  const paperScrollRef = useRef<HTMLDivElement>(null); // the overflow:auto container
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const flashKey = useCallback((k: string) => {
    setPressedKey(k);
    setTimeout(() => setPressedKey(""), 120);
  }, []);

  // ── Auto-scroll paper: only move if cursor is below visible area ────────
  // This fires after every text update. We scroll the container so the
  // last line is always visible — but never clip lines that are already
  // visible at the top (user can scroll back up to read them).
  const autoScrollPaper = useCallback(() => {
    const el = paperScrollRef.current;
    if (!el) return;
    // scrollHeight = total content height, clientHeight = visible window
    // Only scroll down if content overflows
    const shouldScroll = el.scrollHeight > el.clientHeight;
    if (shouldScroll) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        el.scrollTop = el.scrollHeight;
      } else {
        el.animate(
          [{ scrollTop: el.scrollTop }, { scrollTop: el.scrollHeight }],
          {
            duration: 160,
            delay: 80,
            easing: "cubic-bezier(0.25, 0.8, 0.3, 1)",
            fill: "forwards",
          },
        );
        // Fallback for browsers that don't support scrollTop in animate
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 260);
      }
    }
  }, []);

  // ── Keyboard input ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();

      if (e.key === "Backspace") {
        setText((t) => t.slice(0, -1));
        flashKey("Backspace");
        return;
      }

      if (e.key === "Enter") {
        if (text.length >= MAX_CHARS) return;
        setText((t) => t + "\n");
        setCarriageReturn((n) => n + 1);
        flashKey("Enter");
        // auto-scroll fires via useEffect below
        return;
      }

      if (e.key === "Tab") {
        setText((t) => (t.length + 4 <= MAX_CHARS ? t + "    " : t));
        flashKey("Tab");
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setText((t) => (t.length < MAX_CHARS ? t + e.key : t));
        flashKey(e.key.toUpperCase());
      }
    },
    [text, flashKey],
  );

  // Auto-scroll whenever text changes
  useEffect(() => {
    autoScrollPaper();
  }, [text, autoScrollPaper]);

  // ── Screen-key clicks ───────────────────────────────────────────────────
  const handleKeyClick = useCallback(
    (value: string, type: "char" | "key") => {
      if (type === "char") {
        setText((t) => (t.length < MAX_CHARS ? t + value : t));
        flashKey(value === " " ? " " : value.toUpperCase());
      } else {
        if (value === "Backspace") {
          setText((t) => t.slice(0, -1));
          flashKey("Backspace");
        } else if (value === "Enter") {
          setText((t) => (t.length < MAX_CHARS ? t + "\n" : t));
          setCarriageReturn((n) => n + 1);
          flashKey("Enter");
        } else if (value === "Tab") {
          setText((t) => (t.length + 4 <= MAX_CHARS ? t + "    " : t));
          flashKey("Tab");
        }
      }
      inputRef.current?.focus();
    },
    [flashKey],
  );

  const focusInput = () => inputRef.current?.focus();

  // Visible paper window height = N lines + top/bottom padding
  const PAPER_PAD_V = 22;
  const PAPER_H = PAPER_VISIBLE_LINES * LINE_HEIGHT + PAPER_PAD_V * 2;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden overflow-y-auto selection:bg-pink-200"
      style={{ background: "#FAF7F2" }}
      onClick={focusInput}
    >
      {/* Hidden textarea */}
      <textarea
        ref={inputRef}
        aria-label="Type your text here — it will appear on the paper above"
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

      {/* ── SITE HEADER ── */}
      <header style={{ marginBottom: 28, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Special Elite', 'Courier New', monospace",
            fontSize: "clamp(22px, 4vw, 38px)",
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
            fontFamily: "'Special Elite', 'Courier New', monospace",
            fontSize: "clamp(8px, 1.1vw, 10px)",
            color: "rgba(180,155,140,0.65)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            margin: "6px 0 0",
          }}
        >
          Mechanical Typing Station // 2026
        </p>
      </header>

      {/* ── MAIN UNIT ── */}
      <div
        className="relative w-full flex flex-col items-center"
        style={{ maxWidth: 780 }}
      >
        {/* ── PAPER ─────────────────────────────────────────────────────
            Width: 58% of the 780px max container ≈ matching the platen width.
            The outer div is a fixed-height clipping window (like looking
            through the typewriter's paper slot).
            The inner div holds ALL typed content and overflows downward.
            overflow:auto lets the user scroll up to re-read typed lines.
            Auto-scroll (on Enter / on typing past bottom) keeps the cursor
            in view — just like paper advancing through a real machine.
        ─────────────────────────────────────────────────────────────── */}
        <div
          onClick={focusInput}
          style={{
            position: "relative",
            zIndex: 10,
            width: "70%",
            marginBottom: -16,
            cursor: "text",
          }}
        >
          {/* Fixed-height scroll window */}
          <div
            ref={paperScrollRef}
            style={{
              position: "relative",
              height: PAPER_H,
              borderRadius: "3px 3px 0 0",
              overflow: "auto", // scrollable by user; auto-scrolled on Enter
              border: "1px solid rgba(0,0,0,0.06)",
              borderBottom: "none",
              /* Paper texture */
              background: `
                repeating-linear-gradient(135deg, rgba(200,185,165,0.045) 0px, rgba(200,185,165,0.045) 1px, transparent 1px, transparent 9px),
                repeating-linear-gradient(45deg,  rgba(190,175,155,0.03)  0px, rgba(190,175,155,0.03)  1px, transparent 1px, transparent 12px),
                repeating-linear-gradient(90deg,  rgba(210,200,185,0.025) 0px, rgba(210,200,185,0.025) 1px, transparent 1px, transparent 18px),
                linear-gradient(160deg, #FFFEF9 0%, #FAF8F2 45%, #F4F0E6 100%)
              `,
              boxShadow: `0 6px 30px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.75), inset 0 6px 14px rgba(0,0,0,0.04)`,
              scrollbarWidth:
                "none" /* hide scrollbar — visually it's a paper sheet */,
            }}
          >
            {/* Content area — grows freely */}
            <div style={{ padding: `${PAPER_PAD_V}px 26px` }}>
              {/* Placeholder */}
              {text.length === 0 && (
                <div
                  style={{
                    fontFamily: "'Special Elite', 'Courier New', monospace",
                    fontSize: "clamp(9px, 1.5vw, 12px)",
                    lineHeight: `${LINE_HEIGHT}px`,
                    color: "rgba(190,170,155,0.5)",
                    fontStyle: "italic",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  Type here…
                </div>
              )}

              {/* Typed text */}
              {text.length > 0 && (
                <div
                  style={{
                    fontFamily: "'Special Elite', 'Courier New', monospace",
                    fontSize: "clamp(9px, 1.5vw, 12px)",
                    lineHeight: `${LINE_HEIGHT}px`,
                    color: "#2a2020",
                    letterSpacing: "0.04em",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {text}
                  {/* Blinking cursor */}
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: "1em",
                      background: "rgba(180,100,100,0.6)",
                      marginLeft: 1,
                      verticalAlign: "text-bottom",
                      animation: "tw-cursor-blink 1s step-end infinite",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Roller shadow overlay — fixed on top of the scroll window, never scrolls */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 22,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.08), transparent)",
              pointerEvents: "none",
              borderRadius: "3px 3px 0 0",
              zIndex: 4,
            }}
          />
          {/* Side edge shadows */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 14,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.04), transparent)",
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
                "linear-gradient(270deg, rgba(0,0,0,0.03), transparent)",
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
      </div>

      <style>{`
        /* Hide scrollbar on the paper — it's a sheet of paper, not a textarea */
        [style*="overflow: auto"]::-webkit-scrollbar { display: none; }
        @keyframes tw-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @media (prefers-reduced-motion: reduce) {
          [style*="tw-cursor-blink"] { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
