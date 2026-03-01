import React from "react";

const Typewriter: React.FC = () => {
  const colors = {
    main: "#F4C2C2", // Baby pink body
    shadow: "#D9A0A0", // Darker pink for depth/strokes
    highlight: "#FDE8E8", // Light pink highlight
    light: "#FFF5F5", // Very light pink for keyboard panel
    keys: "#FBD7D7", // Key fill
    keyHighlight: "#FFEAEA", // Key top highlight
    dark: "#1a1a1a", // Platen/dark elements
    darkMid: "#2e2e2e", // Knobs
    darkAccent: "#444", // Knob stroke
  };

  // Layout constants — easy to adjust
  const PANEL_X = 130;
  const PANEL_W = 740;
  const PANEL_Y = 330;
  const PANEL_H = 200;

  // Key grid — 3 rows × 10 columns, fully contained in panel
  // Panel inner area: x=130..870, y=330..530
  // Keys: r=18, so centers must stay within [148, 852] x [348, 512]
  const KEY_R = 18;
  const KEY_ROWS = [
    { y: 370, count: 10, xStart: 175, xGap: 63 },
    { y: 425, count: 10, xStart: 188, xGap: 63 },
    { y: 478, count: 8, xStart: 240, xGap: 65 },
  ];
  // Spacebar: y=515, well inside panel bottom (330+200=530)
  const SPACEBAR_Y = 515;

  return (
    <div className="w-full h-auto flex items-center justify-center">
      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full drop-shadow-[0_25px_50px_rgba(244,194,194,0.4)]"
        aria-label="Vintage typewriter illustration"
        role="img"
      >
        <defs>
          {/* Body gradient for 3D feel */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="40%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.shadow} />
          </linearGradient>
          {/* Carriage gradient */}
          <linearGradient id="carriageGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.highlight} />
            <stop offset="100%" stopColor={colors.main} />
          </linearGradient>
          {/* Key gradient: highlight top-left */}
          <radialGradient id="keyGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={colors.keyHighlight} />
            <stop offset="100%" stopColor={colors.keys} />
          </radialGradient>
          {/* Panel inset shadow */}
          <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
            <stop offset="20%" stopColor="rgba(0,0,0,0)" />
            <stop offset="80%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
          </linearGradient>
          {/* Drop shadow filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow
              dx="0"
              dy="8"
              stdDeviation="10"
              floodColor="#C07070"
              floodOpacity="0.25"
            />
          </filter>
          <filter id="keyShadow">
            <feDropShadow
              dx="1"
              dy="2"
              stdDeviation="2"
              floodColor="#C07070"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        {/* ═══════════════════════════════════════
            1. CARRIAGE / UPPER SECTION
        ═══════════════════════════════════════ */}
        {/* Carriage body — sits above the main body */}
        <path
          d="M120 145 Q500 112 880 145 L920 275 Q500 305 80 275 Z"
          fill="url(#carriageGrad)"
          stroke={colors.shadow}
          strokeWidth="2.5"
          filter="url(#softShadow)"
        />

        {/* ═══════════════════════════════════════
            2. PLATEN (ROLLER) — on top of carriage
        ═══════════════════════════════════════ */}
        {/* Platen roller bar */}
        <rect
          x="170"
          y="132"
          width="660"
          height="52"
          rx="26"
          fill={colors.dark}
        />
        {/* Platen highlight */}
        <rect
          x="180"
          y="135"
          width="640"
          height="16"
          rx="8"
          fill="rgba(255,255,255,0.08)"
        />

        {/* LEFT knob — cx must be outside platen but still visible */}
        {/* Knob sits at x=148, which is 22px left of platen start (170) */}
        <circle
          cx="152"
          cy="158"
          r="30"
          fill="#333"
          stroke="#555"
          strokeWidth="2"
        />
        <circle cx="152" cy="158" r="18" fill="#3d3d3d" />
        <circle cx="145" cy="152" r="5" fill="rgba(255,255,255,0.15)" />

        {/* RIGHT knob */}
        <circle
          cx="848"
          cy="158"
          r="30"
          fill="#333"
          stroke="#555"
          strokeWidth="2"
        />
        <circle cx="848" cy="158" r="18" fill="#3d3d3d" />
        <circle cx="841" cy="152" r="5" fill="rgba(255,255,255,0.15)" />

        {/* Paper guide rail */}
        <rect x="250" y="125" width="500" height="8" rx="4" fill="#444" />

        {/* ═══════════════════════════════════════
            3. MAIN BODY
        ═══════════════════════════════════════ */}
        <path
          d="M80 275 Q500 305 920 275 L960 570 Q500 600 40 570 Z"
          fill="url(#bodyGrad)"
          stroke={colors.shadow}
          strokeWidth="2.5"
          filter="url(#softShadow)"
        />

        {/* Body highlight edge (top) */}
        <path
          d="M80 275 Q500 305 920 275 L915 285 Q500 315 85 285 Z"
          fill="rgba(255,255,255,0.25)"
        />

        {/* Subtle vertical grill lines in lower body */}
        {[...Array(18)].map((_, i) => (
          <line
            key={`grill-${i}`}
            x1={200 + i * 37}
            y1={490}
            x2={210 + i * 37}
            y2={560}
            stroke={colors.shadow}
            strokeWidth="1.5"
            opacity="0.35"
          />
        ))}

        {/* ═══════════════════════════════════════
            4. KEYBOARD PANEL
        ═══════════════════════════════════════ */}
        {/* Panel background */}
        <rect
          x={PANEL_X}
          y={PANEL_Y}
          width={PANEL_W}
          height={PANEL_H}
          rx="18"
          fill={colors.light}
          opacity="0.55"
          stroke={colors.shadow}
          strokeWidth="1.5"
        />
        {/* Panel inset gradient overlay */}
        <rect
          x={PANEL_X}
          y={PANEL_Y}
          width={PANEL_W}
          height={PANEL_H}
          rx="18"
          fill="url(#panelGrad)"
        />

        {/* ═══════════════════════════════════════
            5. KEYS — all rows fully inside panel
            Panel: y=330..530, with KEY_R=18
            Key centers must be in [348..512]
        ═══════════════════════════════════════ */}
        {KEY_ROWS.map((row, rowIdx) =>
          [...Array(row.count)].map((_, i) => {
            const cx = row.xStart + i * row.xGap;
            const cy = row.y;
            return (
              <g key={`${rowIdx}-${i}`} filter="url(#keyShadow)">
                {/* Key shadow/base (slightly offset) */}
                <circle
                  cx={cx}
                  cy={cy + 3}
                  r={KEY_R}
                  fill={colors.shadow}
                  opacity="0.5"
                />
                {/* Key face */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={KEY_R}
                  fill="url(#keyGrad)"
                  stroke={colors.shadow}
                  strokeWidth="1.5"
                />
                {/* Key top highlight */}
                <ellipse
                  cx={cx - 4}
                  cy={cy - 5}
                  rx={7}
                  ry={4}
                  fill="rgba(255,255,255,0.5)"
                />
              </g>
            );
          }),
        )}

        {/* ═══════════════════════════════════════
            6. SPACEBAR — inside panel bottom area
            Panel bottom = 330+200 = 530
            Spacebar center y=515, height=22 → y=504..526 ✓
        ═══════════════════════════════════════ */}
        {/* Spacebar shadow */}
        <rect
          x="318"
          y={SPACEBAR_Y + 3}
          width="364"
          height="22"
          rx="11"
          fill={colors.shadow}
          opacity="0.5"
        />
        {/* Spacebar face */}
        <rect
          x="318"
          y={SPACEBAR_Y}
          width="364"
          height="22"
          rx="11"
          fill="url(#keyGrad)"
          stroke={colors.shadow}
          strokeWidth="1.5"
        />
        {/* Spacebar highlight */}
        <rect
          x="338"
          y={SPACEBAR_Y + 4}
          width="120"
          height="6"
          rx="3"
          fill="rgba(255,255,255,0.45)"
        />

        {/* ═══════════════════════════════════════
            7. BOTTOM BODY DETAILS
        ═══════════════════════════════════════ */}
        {/* Two side feet / rubber bumpers */}
        <ellipse
          cx="160"
          cy="575"
          rx="45"
          ry="12"
          fill={colors.shadow}
          opacity="0.6"
        />
        <ellipse
          cx="840"
          cy="575"
          rx="45"
          ry="12"
          fill={colors.shadow}
          opacity="0.6"
        />

        {/* Center brand badge */}
        <rect
          x="440"
          y="553"
          width="120"
          height="28"
          rx="14"
          fill={colors.shadow}
          opacity="0.5"
        />
        <rect
          x="444"
          y="557"
          width="112"
          height="20"
          rx="10"
          fill={colors.main}
        />
        <text
          x="500"
          y="571"
          textAnchor="middle"
          fontSize="9"
          letterSpacing="3"
          fill={colors.shadow}
          fontFamily="serif"
          fontStyle="italic"
        >
          No. 1
        </text>
      </svg>
    </div>
  );
};

export default Typewriter;
