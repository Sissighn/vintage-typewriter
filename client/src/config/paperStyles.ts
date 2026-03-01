// File: client/src/config/paperStyles.ts

export interface PaperStyle {
  id: string;
  name: string;
  background: string;
  backgroundSize?: string;
  textColor?: string;
}

export const PAPER_STYLES: Record<string, PaperStyle> = {
  classic: {
    id: "classic",
    name: "VINTAGE CREAM",
    background: `
      repeating-linear-gradient(135deg, rgba(200,185,165,.02) 0px, rgba(200,185,165,.02) 1px, transparent 1px, transparent 9px),
      linear-gradient(160deg, #FFFEF9 0%, #FAF8F2 45%, #F4F0E6 100%)
    `,
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
  },
  sand: {
    id: "sand",
    name: "WARM SAND",
    background: "#E8E4DF",
    textColor: "#333333",
  },
};
