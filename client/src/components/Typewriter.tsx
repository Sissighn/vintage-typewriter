import React, { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
//  TYPEWRITER — pure CSS illustration
//  Props:
//    pressedKey      — key label currently flashing (for press anim)
//    onKeyClick      — screen-key click handler
//    carriageReturn  — increment this to trigger carriage-return anim
// ─────────────────────────────────────────────────────────────────

interface TypewriterProps {
  pressedKey?: string;
  onKeyClick?: (value: string, type: "char" | "key") => void;
  carriageReturn?: number; // incremented each time Enter is pressed
}

// ── Key row data ──────────────────────────────────────────────────
const ROWS: {
  label: string;
  char?: string;
  keyName?: string;
  wide?: "sm" | "md" | "lg";
  special?: boolean;
}[][] = [
  [
    { label: "TAB", keyName: "Tab", wide: "sm", special: true },
    { label: "!", char: "!" },
    { label: "@", char: "@" },
    { label: "#", char: "#" },
    { label: "$", char: "$" },
    { label: "%", char: "%" },
    { label: "^", char: "^" },
    { label: "&", char: "&" },
    { label: "*", char: "*" },
    { label: "(", char: "(" },
    { label: ")", char: ")" },
    { label: "⌫", keyName: "Backspace", wide: "md", special: true },
  ],
  [
    { label: "Q", char: "Q" },
    { label: "W", char: "W" },
    { label: "E", char: "E" },
    { label: "R", char: "R" },
    { label: "T", char: "T" },
    { label: "Y", char: "Y" },
    { label: "U", char: "U" },
    { label: "I", char: "I" },
    { label: "O", char: "O" },
    { label: "P", char: "P" },
    { label: "RET", keyName: "Enter", wide: "md", special: true },
  ],
  [
    { label: "CAPS", keyName: "CapsLock", wide: "sm", special: true },
    { label: "A", char: "A" },
    { label: "S", char: "S" },
    { label: "D", char: "D" },
    { label: "F", char: "F" },
    { label: "G", char: "G" },
    { label: "H", char: "H" },
    { label: "J", char: "J" },
    { label: "K", char: "K" },
    { label: "L", char: "L" },
    { label: ";", char: ";" },
  ],
  [
    { label: "SHIFT", keyName: "Shift", wide: "lg", special: true },
    { label: "Z", char: "Z" },
    { label: "X", char: "X" },
    { label: "C", char: "C" },
    { label: "V", char: "V" },
    { label: "B", char: "B" },
    { label: "N", char: "N" },
    { label: "M", char: "M" },
    { label: ",", char: "," },
    { label: ".", char: "." },
    { label: "SHIFT", keyName: "Shift", wide: "lg", special: true },
  ],
];

const Typewriter: React.FC<TypewriterProps> = ({
  pressedKey = "",
  onKeyClick,
  carriageReturn = 0,
}) => {
  // Ref to the carriage wrapper — animated via Web Animations API
  // so we never touch React state for the animation itself (no re-renders).
  const carriageRef = useRef<HTMLDivElement>(null);
  const rollerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const rollerAnimRef = useRef<Animation | null>(null);

  // ── Carriage-return animation ────────────────────────────────
  useEffect(() => {
    if (carriageReturn === 0) return;

    // Respect prefers-reduced-motion
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const carriage = carriageRef.current;
    const roller = rollerRef.current;
    if (!carriage) return;

    // Cancel any in-flight animation so rapid Enter presses reset cleanly
    animRef.current?.cancel();
    rollerAnimRef.current?.cancel();

    // ── Carriage translateX sequence ──────────────────────────
    // Phase 1 (0–80ms):   snap right by 12px (tension build) — ease-out
    // Phase 2 (80–230ms): slam back to 0 — mechanical overshoot cubic
    // Phase 3 (230–280ms): micro-vibrate: +1px → -1px → 0
    // Phase 4 (280–320ms): settle to 0
    // ── Carriage-return: snap right (tension) → slam left (mechanical) ──
    // Phase 1 (0–25%):  quick snap right — ease-out (spring tension release)
    // Phase 2 (25–100%): fast slam all the way back to 0 — cubic overshoot
    // No wobble, no micro-vibrations — just the two clean mechanical phases
    animRef.current = carriage.animate(
      [
        { transform: "translateX(0px)", offset: 0, easing: "ease-out" },
        {
          transform: "translateX(20px)",
          offset: 0.25,
          easing: "cubic-bezier(0.1, 0.9, 0.2, 1.0)",
        },
        { transform: "translateX(0px)", offset: 1 },
      ],
      {
        duration: 320,
        easing: "linear",
        fill: "none",
      },
    );

    // Roller rotates slightly forward as paper advances
    if (roller) {
      rollerAnimRef.current = roller.animate(
        [
          { transform: "rotate(0deg)", offset: 0 },
          { transform: "rotate(0deg)", offset: 0.25 },
          { transform: "rotate(3deg)", offset: 1 },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(0.1, 0.9, 0.2, 1.0)",
          fill: "none",
        },
      );
    }
  }, [carriageReturn]);

  // ── Key helpers ───────────────────────────────────────────────
  const wideW: Record<string, string> = {
    sm: "clamp(34px,6vw,52px)",
    md: "clamp(48px,7.5vw,68px)",
    lg: "clamp(58px,9vw,84px)",
  };
  const KEY_SIZE = "clamp(22px,3.8vw,34px)";
  const KEY_GAP = "clamp(3px,0.55vw,5px)";

  function isPressed(k: { char?: string; keyName?: string }) {
    if (!pressedKey) return false;
    return (
      k.char?.toUpperCase() === pressedKey.toUpperCase() ||
      k.keyName === pressedKey
    );
  }

  function handleKey(
    e: React.MouseEvent,
    k: { char?: string; keyName?: string },
  ) {
    e.preventDefault();
    if (!onKeyClick) return;
    if (k.char) onKeyClick(k.char, "char");
    if (k.keyName) onKeyClick(k.keyName, "key");
  }

  const keyBase = (
    wide?: "sm" | "md" | "lg",
    _special?: boolean,
    pressed?: boolean,
  ): React.CSSProperties => ({
    position: "relative",
    width: wide ? wideW[wide] : KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: wide ? "6px" : "50%",
    cursor: "pointer",
    flexShrink: 0,
    userSelect: "none",
    transform: pressed
      ? "translateY(3px) scale(0.95)"
      : "translateY(0) scale(1)",
    transition: "transform 80ms ease, box-shadow 80ms ease",
    boxShadow: pressed
      ? "0 1px 0 0 #D6C8BE, 0 2px 4px rgba(0,0,0,0.35)"
      : "0 4px 0 0 #D6C8BE, 0 5px 8px rgba(0,0,0,0.45)",
    background: "transparent",
  });

  const keyFace = (special?: boolean): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background: special
      ? "radial-gradient(circle at 32% 28%, #fff 0%, #EDE7DF 35%, #D8CFCA 100%)"
      : "radial-gradient(circle at 32% 28%, #fff 0%, #F2ECE4 35%, #DDD5CC 100%)",
    border: "1px solid rgba(180,165,150,0.6)",
    boxShadow:
      "inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.1)",
    pointerEvents: "none",
  });

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <style>{`
        .tw-knob-spoke  { stroke: #C8C8C8; stroke-width: 2; }
        .tw-spool-spoke { stroke: #3A3A3A; stroke-width: 1.5; }

        /* ── Carriage-return keyframes (CSS fallback for browsers
           without Web Animations API — extremely rare) ── */
        @keyframes tw-carriage-return {
          0%   { transform: translateX(0px); }
          25%  { transform: translateX(20px); }
          100% { transform: translateX(0px); }
        }
        @keyframes tw-roller-turn {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(0deg); }
          100% { transform: rotate(3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tw-carriage-anim { animation: none !important; }
        }
      `}</style>

      {/* ── Machine outer wrapper — stays completely static ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "820px",
          filter:
            "drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 8px 24px rgba(180,100,100,0.18))",
        }}
        aria-label="Vintage baby-pink typewriter"
        role="img"
      >
        {/* ════════════════════════════════════════════════════════
            .carriage — THE ONLY ELEMENT THAT TRANSLATES ON ENTER
            Contains: carriage housing + platen + knobs + paper rail
            The body/keyboard below is NOT inside this wrapper.
        ════════════════════════════════════════════════════════ */}
        <div
          ref={carriageRef}
          style={{
            position: "relative",
            willChange: "transform",
            // translateX is driven by Web Animations API (carriageReturn effect)
          }}
        >
          {/* ── Carriage housing ── */}
          <div
            style={{
              position: "relative",
              background: "linear-gradient(180deg, #FDDEDE 0%, #F4C2C2 100%)",
              borderRadius: "10px 10px 0 0",
              height: "clamp(50px,8vw,72px)",
              margin: "0 3%",
              border: "1.5px solid #D4A0A0",
              borderBottom: "none",
              boxShadow:
                "inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08)",
              zIndex: 5,
              overflow: "visible",
            }}
          >
            {/* Top glint */}
            <div
              style={{
                position: "absolute",
                top: 4,
                left: "12%",
                right: "12%",
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.5)",
              }}
            />

            {/* Margin levers */}
            {[false, true].map((isRight, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "30%",
                  [isRight ? "right" : "left"]: "2%",
                  height: "clamp(8px,1.5vw,12px)",
                  width: "clamp(28px,5vw,44px)",
                  background: "linear-gradient(180deg, #C8C8C8, #8A8A8A)",
                  borderRadius: 6,
                  border: "1px solid #8A8A8A",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              />
            ))}

            {/* Paper guide rail */}
            <div
              style={{
                position: "absolute",
                top: "clamp(-28px,-4vw,-20px)",
                left: "8%",
                right: "8%",
                height: 10,
                background: "linear-gradient(180deg, #555 0%, #333 100%)",
                borderRadius: 5,
                border: "1px solid #444",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              {["22%", "72%"].map((left, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 18,
                    height: 18,
                    background:
                      "radial-gradient(circle at 35% 30%, #555, #222)",
                    borderRadius: 4,
                    border: "1px solid #555",
                  }}
                />
              ))}
            </div>

            {/* Platen + knobs */}
            <div
              style={{
                position: "absolute",
                top: "clamp(-18px,-3vw,-14px)",
                left: "-2%",
                right: "-2%",
                display: "flex",
                alignItems: "center",
                zIndex: 20,
              }}
            >
              <KnobSVG />
              {/* Roller — ref'd for rotation animation */}
              <div
                ref={rollerRef}
                style={{
                  flex: 1,
                  height: "clamp(18px,3vw,28px)",
                  background:
                    "linear-gradient(180deg, #333 0%, #111 25%, #2A2A2A 60%, #111 100%)",
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 7px)",
                  borderRadius: 14,
                  border: "1.5px solid #333",
                  overflow: "hidden",
                  boxShadow:
                    "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                  willChange: "transform",
                  transformOrigin: "center center",
                }}
              />
              <KnobSVG />
            </div>
          </div>
        </div>
        {/* ── End .carriage ─────────────────────────────────────── */}

        {/* ════════════════════════════════════════════════════════
            MAIN BODY — completely static, never animated
        ════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(180deg, #FDDEDE 0%, #F4C2C2 35%, #F4C2C2 75%, #D4A0A0 100%)",
            borderRadius: "0 0 18px 18px",
            padding:
              "clamp(12px,2vw,20px) clamp(10px,1.8vw,16px) clamp(16px,2.5vw,22px)",
            border: "1.5px solid #D4A0A0",
            borderTop: "none",
            boxShadow: `
            inset 0 2px 8px rgba(255,255,255,0.35),
            inset 0 -3px 8px rgba(0,0,0,0.1),
            4px 0 0 0 #D4A0A0, -4px 0 0 0 #D4A0A0,
            0 8px 0 0 #BC8888, 6px 8px 0 0 #BC8888, -6px 8px 0 0 #BC8888
          `,
          }}
        >
          {/* Body top glint */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 2,
              background: "rgba(255,255,255,0.45)",
            }}
          />

          {/* Typebar recess */}
          <div
            style={{
              position: "relative",
              margin: "0 8% clamp(8px,1.5vw,14px)",
              height: "clamp(40px,7vw,62px)",
            }}
          >
            <SpoolSVG side="left" />
            <SpoolSVG side="right" />
            {/* Bridge bracket */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "10%",
                height: "32%",
                background: "linear-gradient(180deg, #444, #222)",
                borderRadius: "3px 3px 0 0",
                border: "1px solid #555",
              }}
            />
            {/* Typebar dark recess */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "58%",
                height: "100%",
                background: "#0E0E0E",
                borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                overflow: "hidden",
                border: "1.5px solid #2A2A2A",
                borderBottom: "none",
                boxShadow: "inset 0 4px 20px rgba(0,0,0,0.8)",
              }}
            >
              {/* Fan lines */}
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "140%",
                  height: "200%",
                  background:
                    "repeating-conic-gradient(from -90deg at 50% 100%, transparent 0deg, transparent 3.8deg, rgba(80,80,80,0.7) 3.8deg, rgba(80,80,80,0.7) 4.6deg)",
                }}
              />
              {/* Inner hub */}
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "26%",
                  height: "30%",
                  background: "radial-gradient(ellipse at 50% 80%, #000, #111)",
                  borderRadius: "50%",
                  border: "1px solid #333",
                }}
              />
            </div>
          </div>

          {/* Keyboard recess */}
          <div
            style={{
              background: "#181818",
              borderRadius: 12,
              padding:
                "clamp(8px,1.5vw,14px) clamp(6px,1.2vw,12px) clamp(6px,1.2vw,10px)",
              border: "1.5px solid #111",
              boxShadow:
                "inset 0 4px 16px rgba(0,0,0,0.6), inset 0 -2px 6px rgba(0,0,0,0.3)",
            }}
          >
            {ROWS.map((row, rIdx) => (
              <div
                key={rIdx}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: KEY_GAP,
                  marginBottom: rIdx < ROWS.length - 1 ? KEY_GAP : 0,
                }}
              >
                {row.map((k, kIdx) => {
                  const pressed = isPressed(k);
                  return (
                    <div
                      key={kIdx}
                      style={keyBase(k.wide, k.special, pressed)}
                      onMouseDown={(e) => handleKey(e, k)}
                      role="button"
                      aria-label={k.label}
                      tabIndex={-1}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          top: 3,
                          borderRadius: "inherit",
                          background: "#D6C8BE",
                        }}
                      />
                      <div style={keyFace(k.special)} />
                      <div
                        style={{
                          position: "absolute",
                          top: "18%",
                          left: "20%",
                          width: "28%",
                          height: "20%",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.55)",
                          transform: "rotate(-20deg)",
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                          fontFamily: "Georgia, 'Times New Roman', serif",
                          fontSize: "clamp(7px,1.15vw,10px)",
                          fontWeight: 700,
                          color: "#1C1C1C",
                          pointerEvents: "none",
                          userSelect: "none",
                        }}
                      >
                        {k.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Spacebar */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: KEY_GAP,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "52%",
                  height: "clamp(16px,2.8vw,24px)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transform:
                    pressedKey === " " ? "translateY(3px)" : "translateY(0)",
                  transition: "transform 80ms ease, box-shadow 80ms ease",
                  boxShadow:
                    pressedKey === " "
                      ? "0 1px 0 0 rgba(180,150,140,0.7), 0 2px 4px rgba(0,0,0,0.3)"
                      : "0 4px 0 0 rgba(180,150,140,0.7), 0 5px 8px rgba(0,0,0,0.4)",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onKeyClick?.(" ", "char");
                }}
                role="button"
                aria-label="Spacebar"
                tabIndex={-1}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    top: 3,
                    borderRadius: 8,
                    background: "rgba(180,150,140,0.5)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 8,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, #EDE4DE 40%, #DDD4CC 100%)",
                    border: "1px solid rgba(180,165,150,0.5)",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "8%",
                    width: "28%",
                    height: "35%",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.45)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Body bottom: feet + brand */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 4%",
              marginTop: "clamp(6px,1vw,10px)",
            }}
          >
            <Foot />
            <div
              style={{
                background: "linear-gradient(135deg, #C8C8C8, #8A8A8A, #666)",
                borderRadius: 4,
                padding: "3px 12px",
                border: "1px solid #8A8A8A",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(7px,1.1vw,9px)",
                  letterSpacing: "0.2em",
                  color: "#C8C8C8",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                VINTAGE No. 1
              </span>
            </div>
            <Foot />
          </div>
        </div>
        {/* ── End static body ───────────────────────────────────── */}
      </div>
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────

const KnobSVG: React.FC = () => {
  const size = "clamp(28px,5vw,44px)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="kg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#C8C8C8" />
          <stop offset="50%" stopColor="#8A8A8A" />
          <stop offset="100%" stopColor="#444" />
        </radialGradient>
      </defs>
      <circle
        cx="22"
        cy="22"
        r="21"
        fill="#2A2A2A"
        stroke="#444"
        strokeWidth="2"
      />
      <circle cx="22" cy="22" r="18" fill="url(#kg)" />
      <circle
        cx="22"
        cy="22"
        r="10"
        fill="#333"
        stroke="#555"
        strokeWidth="1"
      />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={22 + Math.cos(r) * 10}
            y1={22 + Math.sin(r) * 10}
            x2={22 + Math.cos(r) * 17}
            y2={22 + Math.sin(r) * 17}
            className="tw-knob-spoke"
          />
        );
      })}
      <ellipse
        cx="16"
        cy="16"
        rx="4"
        ry="2.5"
        fill="rgba(255,255,255,0.28)"
        transform="rotate(-20,16,16)"
      />
    </svg>
  );
};

const SpoolSVG: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const size = "clamp(22px,4vw,34px)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      style={{ position: "absolute", bottom: 0, [side]: "14%" }}
    >
      <circle
        cx="17"
        cy="17"
        r="16"
        fill="#2A2A2A"
        stroke="#3A3A3A"
        strokeWidth="2"
      />
      <circle cx="17" cy="17" r="11" fill="#1A1A1A" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={17 + Math.cos(r) * 7}
            y1={17 + Math.sin(r) * 7}
            x2={17 + Math.cos(r) * 11}
            y2={17 + Math.sin(r) * 11}
            className="tw-spool-spoke"
          />
        );
      })}
      <circle cx="17" cy="17" r="5" fill="#333" stroke="#444" strokeWidth="1" />
      <circle
        cx="17"
        cy="17"
        r="16"
        fill="rgba(244,194,194,0.12)"
        stroke="#F4C2C2"
        strokeWidth="1.5"
      />
    </svg>
  );
};

const Foot: React.FC = () => (
  <div
    style={{
      width: "clamp(28px,5vw,44px)",
      height: "clamp(10px,1.8vw,16px)",
      background: "radial-gradient(ellipse at 40% 30%, #2A2A2A, #111)",
      borderRadius: 6,
      border: "1px solid #333",
      boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    }}
  />
);

export default Typewriter;
