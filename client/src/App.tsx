import React, { useState, useRef, useEffect, useCallback } from "react";
import Typewriter from "./components/Typewriter";

const MAX_CHARS = 400;

function App() {
  const [text, setText] = useState("");
  const [pressedKey, setPressedKey] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const flashKey = useCallback((k: string) => {
    setPressedKey(k);
    setTimeout(() => setPressedKey(""), 120);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (e.key === "Backspace") {
      setText((t) => t.slice(0, -1));
      flashKey("Backspace");
      return;
    }
    if (e.key === "Enter") {
      setText((t) => (t.length < MAX_CHARS ? t + "\n" : t));
      flashKey("Enter");
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
  };

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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-8 px-4 overflow-x-hidden overflow-y-auto selection:bg-pink-200"
      style={{ background: "#FAF7F2" }}
      onClick={focusInput}
    >
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

      {/* ── SITE HEADER — outside paper ── */}
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
        {/* ── PAPER — feeds into typewriter platen ── */}
        <div
          onClick={focusInput}
          style={{
            position: "relative",
            zIndex: 10,
            width: "52%",
            marginBottom: -16,
            cursor: "text",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "3px 3px 0 0",
              padding: "22px 26px 18px",
              minHeight: 185,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.06)",
              borderBottom: "none",
              /* Paper texture: warm fibrous feel via layered micro-gradients, no lines */
              background: `
              repeating-linear-gradient(
                135deg,
                rgba(200,185,165,0.045) 0px,
                rgba(200,185,165,0.045) 1px,
                transparent 1px,
                transparent 9px
              ),
              repeating-linear-gradient(
                45deg,
                rgba(190,175,155,0.03) 0px,
                rgba(190,175,155,0.03) 1px,
                transparent 1px,
                transparent 12px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(210,200,185,0.025) 0px,
                rgba(210,200,185,0.025) 1px,
                transparent 1px,
                transparent 18px
              ),
              linear-gradient(160deg, #FFFEF9 0%, #FAF8F2 45%, #F4F0E6 100%)
            `,
              boxShadow: `
              0 6px 30px rgba(0,0,0,0.09),
              0 1px 4px rgba(0,0,0,0.05),
              inset 0 0 0 1px rgba(255,255,255,0.75),
              inset 0 6px 14px rgba(0,0,0,0.04)
            `,
            }}
          >
            {/* Roller shadow at paper top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 22,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.07), transparent)",
                pointerEvents: "none",
                borderRadius: "3px 3px 0 0",
              }}
            />
            {/* Left edge aged shadow */}
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
              }}
            />
            {/* Right edge aged shadow */}
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
              }}
            />

            {/* Text + placeholder */}
            <div
              style={{
                position: "relative",
                fontFamily: "'Special Elite', 'Courier New', monospace",
                fontSize: "clamp(9px, 1.5vw, 12px)",
                lineHeight: 1.9,
                color: "#2a2020",
                letterSpacing: "0.04em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                minHeight: 120,
              }}
            >
              {text.length === 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    color: "rgba(190,170,155,0.5)",
                    fontStyle: "italic",
                    pointerEvents: "none",
                  }}
                >
                  Type here…
                </span>
              )}
              {text}
              {/* Blinking cursor */}
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "rgba(180,100,100,0.55)",
                  marginLeft: 1,
                  verticalAlign: "text-bottom",
                  animation: "tw-cursor-blink 1s step-end infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── TYPEWRITER ILLUSTRATION ── */}
        <div style={{ position: "relative", zIndex: 0, width: "100%" }}>
          <Typewriter pressedKey={pressedKey} onKeyClick={handleKeyClick} />
        </div>
      </div>

      <style>{`
        @keyframes tw-cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @media (prefers-reduced-motion: reduce) {
          [style*="tw-cursor-blink"] { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
