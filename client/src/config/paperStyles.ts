export interface PaperStyle {
  id: string;
  name: string;
  icon: string;
  background: string;
  backgroundSize?: string;
  textColor?: string;
}

export const PAPER_STYLES: Record<string, PaperStyle> = {
  classic: {
    id: "classic",
    name: "Vintage Creme",
    icon: "📜",
    background: `
      repeating-linear-gradient(135deg, rgba(200,185,165,.045) 0px, rgba(200,185,165,.045) 1px, transparent 1px, transparent 9px),
      repeating-linear-gradient(45deg, rgba(190,175,155,.03) 0px, rgba(190,175,155,.03) 1px, transparent 1px, transparent 12px),
      linear-gradient(160deg, #FFFEF9 0%, #FAF8F2 45%, #F4F0E6 100%)
    `,
  },
  plain: {
    id: "plain",
    name: "Reinweiß",
    icon: "📄",
    background: "#FFFFFF",
    textColor: "#1a1a1a",
  },
  blueprint: {
    id: "blueprint",
    name: "Blaupause",
    icon: "📐",
    background: `
      linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
      #2A4B8C
    `,
    backgroundSize: "20px 20px",
    textColor: "#E0E8FF",
  },
  legal: {
    id: "legal",
    name: "Kanzlei",
    icon: "⚖️",
    background: `
      linear-gradient(90deg, transparent 39px, #f2a6a6 39px, #f2a6a6 41px, transparent 41px),
      linear-gradient(#FDF5E6 95%, #e1d9c6 5%)
    `,
    backgroundSize: "100% 24px",
    textColor: "#2c3e50",
  },
};
