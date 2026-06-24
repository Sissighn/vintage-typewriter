// File: client/src/config/paperStyles.ts

export interface PaperStyle {
  id: string;
  name: string;
  background: string;
  backgroundSize?: string;
  textColor: string;
  borderColor?: string;
  shadow?: string;
  exportBackground?: string;
}

export const PAPER_STYLES: Record<string, PaperStyle> = {
  classic: {
    id: "classic",
    name: "VINTAGE CREAM",
    background: `
      repeating-linear-gradient(135deg, rgba(200,185,165,.02) 0px, rgba(200,185,165,.02) 1px, transparent 1px, transparent 9px),
      linear-gradient(160deg, #FFFEF9 0%, #FAF8F2 45%, #F4F0E6 100%)
    `,
    textColor: "#4a4540",
  },
  plain: {
    id: "plain",
    name: "PURE WHITE",
    background: "#FFFFFF",
    textColor: "#1a1a1a",
  },
  ivory: {
    id: "ivory",
    name: "SOFT IVORY",
    background: "#FBF9F1",
    textColor: "#2c2c2c",
  },
  linen: {
    id: "linen",
    name: "NATURAL LINEN",
    background: `
      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px),
      repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0.02) 2px),
      #F5F2ED
    `,
    backgroundSize: "3px 3px",
    textColor: "#4f4740",
  },
  sand: {
    id: "sand",
    name: "WARM SAND",
    background: "#E8E4DF",
    textColor: "#333333",
  },
  blueprint: {
    id: "blueprint",
    name: "BLUEPRINT",
    background: `
      linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px),
      linear-gradient(135deg, #123b64 0%, #0d2f54 48%, #08233f 100%)
    `,
    backgroundSize: "24px 24px, 24px 24px, auto",
    textColor: "#f6fbff",
    borderColor: "#355f82",
    shadow: "0 18px 50px rgba(9, 35, 63, 0.22)",
  },
  legal: {
    id: "legal",
    name: "LEGAL PAD",
    background: `
      linear-gradient(90deg, transparent 0 52px, rgba(214, 73, 73, .38) 52px 54px, transparent 54px),
      repeating-linear-gradient(0deg, transparent 0 30px, rgba(86, 126, 178, .34) 31px 32px),
      linear-gradient(160deg, #fff9bf 0%, #f8ec8f 100%)
    `,
    textColor: "#34312b",
    borderColor: "#e0d16f",
  },
  airmail: {
    id: "airmail",
    name: "AIRMAIL",
    background: `
      linear-gradient(135deg, rgba(181, 50, 56, .12) 0 12px, transparent 12px 24px, rgba(42, 96, 156, .12) 24px 36px, transparent 36px 48px),
      linear-gradient(160deg, #fffdf7 0%, #f8f3e9 100%)
    `,
    backgroundSize: "48px 48px, auto",
    textColor: "#343845",
    borderColor: "#c43d46",
  },
  carbon: {
    id: "carbon",
    name: "CARBON COPY",
    background: `
      repeating-linear-gradient(0deg, rgba(255,255,255,.04) 0 1px, transparent 1px 5px),
      linear-gradient(160deg, #202734 0%, #121824 100%)
    `,
    textColor: "#c9d7ff",
    borderColor: "#46546d",
    shadow: "0 18px 50px rgba(15, 20, 30, 0.25)",
  },
  newspaper: {
    id: "newspaper",
    name: "NEWSPAPER",
    background: `
      repeating-linear-gradient(90deg, rgba(0,0,0,.025) 0 1px, transparent 1px 13px),
      repeating-linear-gradient(0deg, rgba(0,0,0,.018) 0 1px, transparent 1px 7px),
      linear-gradient(160deg, #f0ede3 0%, #ded8c8 100%)
    `,
    textColor: "#24201c",
    borderColor: "#c9c0ad",
  },
  darkInk: {
    id: "darkInk",
    name: "DARK INK",
    background: `
      radial-gradient(circle at 20% 10%, rgba(255,255,255,.08), transparent 26%),
      linear-gradient(160deg, #2d2927 0%, #151312 100%)
    `,
    textColor: "#f4e7d3",
    borderColor: "#5a4c43",
    shadow: "0 18px 50px rgba(17, 13, 11, 0.28)",
  },
  custom: {
    id: "custom",
    name: "CUSTOM COLOR",
    background: "#fff8ee",
    textColor: "#3d3731",
  },
};

export const RIBBON_COLORS = {
  auto: { id: "auto", name: "AUTO RIBBON", color: null },
  black: { id: "black", name: "BLACK", color: "#302b27" },
  sepia: { id: "sepia", name: "SEPIA", color: "#65442f" },
  blue: { id: "blue", name: "ROYAL BLUE", color: "#243f77" },
  crimson: { id: "crimson", name: "CRIMSON", color: "#842f3b" },
  white: { id: "white", name: "WHITE INK", color: "#f7f3e9" },
} as const;

export type RibbonId = keyof typeof RIBBON_COLORS;
export type InkStrength = "faint" | "normal" | "deep";

export const INK_STRENGTHS: Record<
  InkStrength,
  { id: InkStrength; name: string; opacity: number; fontWeight: number; shadow: string }
> = {
  faint: {
    id: "faint",
    name: "FAINT",
    opacity: 0.62,
    fontWeight: 400,
    shadow: "none",
  },
  normal: {
    id: "normal",
    name: "NORMAL",
    opacity: 0.86,
    fontWeight: 500,
    shadow: "0 0 0.2px currentColor",
  },
  deep: {
    id: "deep",
    name: "DEEP",
    opacity: 1,
    fontWeight: 700,
    shadow: "0.25px 0 currentColor",
  },
};

export function getPaperStyle(typeId: string, customColor: string): PaperStyle {
  if (typeId === "custom") {
    return {
      ...PAPER_STYLES.custom,
      background: `
        repeating-linear-gradient(135deg, rgba(0,0,0,.025) 0px, rgba(0,0,0,.025) 1px, transparent 1px, transparent 10px),
        ${customColor}
      `,
      exportBackground: customColor,
    };
  }

  return PAPER_STYLES[typeId] ?? PAPER_STYLES.classic;
}

export function resolveRibbonColor(
  ribbonId: RibbonId,
  paperStyle: PaperStyle,
): string {
  return RIBBON_COLORS[ribbonId].color ?? paperStyle.textColor;
}
