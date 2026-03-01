import React, { useState } from "react";
import Typewriter from "./components/Typewriter";

function App() {
  const [text, setText] = useState("");

  return (
    <div
      className="
        min-h-screen bg-[#f9f7f2]
        flex flex-col items-center justify-center
        py-6 px-4
        overflow-x-hidden overflow-y-auto
        selection:bg-pink-200
      "
    >
      {/* ── MAIN UNIT ── */}
      <div className="relative w-full max-w-2xl flex flex-col items-center">
        {/* PAPER SHEET — all text lives inside here */}
        <div
          className="
            relative z-10
            w-full
            bg-white
            shadow-[0_16px_48px_rgba(0,0,0,0.09)]
            border border-gray-100
            flex flex-col
          "
        >
          {/* ── Paper Header (inside paper) ── */}
          <div className="px-8 pt-6 pb-3 border-b border-gray-100 flex items-end justify-between shrink-0">
            <div>
              <h1 className="font-typewriter text-pink-400 text-2xl tracking-[0.18em] uppercase leading-none">
                Vintage Typewriter
              </h1>
              <p className="font-typewriter text-[9px] text-gray-300 mt-1 uppercase tracking-widest">
                Mechanical Typing Station // 2026
              </p>
            </div>
          </div>

          {/* ── Writing Area ── */}
          <textarea
            autoFocus
            aria-label="Typewriter text input"
            className="
              w-full
              min-h-70
              px-8 pt-6 pb-3
              bg-transparent
              font-typewriter text-base leading-[1.85]
              text-gray-800
              resize-none
              focus:outline-none
              placeholder:text-gray-300
              caret-pink-400
            "
            placeholder="Click here and start typing…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck="false"
          />

          {/* ── Paper Footer (inside paper) ── */}
          <div className="px-8 py-3 border-t border-gray-50 flex justify-between items-center shrink-0">
            <span className="font-typewriter text-[8px] uppercase tracking-[0.4em] text-gray-300">
              Digital Analog Hybrid
            </span>
            <span className="font-typewriter text-[8px] text-gray-300">
              {text.length} chars
            </span>
          </div>
        </div>

        {/* ── TYPEWRITER ILLUSTRATION ──
            Overlaps the bottom of the paper slightly to create
            the "paper feeding into machine" effect.
            pointer-events-none so clicks pass through to the textarea. */}
        <div className="relative z-0 -mt-14 w-full pointer-events-none">
          <Typewriter />
        </div>
      </div>
    </div>
  );
}

export default App;
