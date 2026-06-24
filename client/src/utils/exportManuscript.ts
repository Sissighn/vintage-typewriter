import type { InkStrength, PaperStyle } from "../config/paperStyles";
import { INK_STRENGTHS } from "../config/paperStyles";

export type ExportFormat = "png" | "txt" | "md" | "pdf";
export type PaperSize = "a4" | "letter";

interface ExportOptions {
  text: string;
  title: string;
  fileName: string;
  format: ExportFormat;
  paperSize: PaperSize;
  paperStyle: PaperStyle;
  inkColor: string;
  inkStrength: InkStrength;
}

const PAGE_DIMENSIONS: Record<PaperSize, { width: number; minHeight: number }> = {
  a4: { width: 794, minHeight: 1123 },
  letter: { width: 816, minHeight: 1056 },
};

export function buildManuscriptTitle(text: string, fallbackTitle?: string): string {
  const firstLine = text.trim().split("\n").find(Boolean);
  return firstLine?.slice(0, 60) || fallbackTitle || "Untitled Manuscript";
}

export function sanitizeFileName(title: string): string {
  const safeTitle = title
    .trim()
    .replace(/[<>:"/\\|?*]/g, "")
    .split("")
    .filter((character) => character.charCodeAt(0) >= 32)
    .join("")
    .replace(/\s+/g, "-")
    .slice(0, 70);

  return safeTitle || `Manuscript-${new Date().toISOString().slice(0, 10)}`;
}

export async function exportManuscript(options: ExportOptions): Promise<void> {
  if (!options.text.trim()) {
    throw new Error("There is no manuscript text to export.");
  }

  if (options.format === "txt") {
    downloadTextFile(options.text, `${options.fileName}.txt`, "text/plain");
    return;
  }

  if (options.format === "md") {
    const markdown = `# ${options.title}\n\n${options.text}`;
    downloadTextFile(markdown, `${options.fileName}.md`, "text/markdown");
    return;
  }

  const exportNode = createExportNode(options);
  document.body.appendChild(exportNode);

  try {
    await document.fonts.ready;

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(exportNode, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      windowWidth: PAGE_DIMENSIONS[options.paperSize].width,
      windowHeight: exportNode.scrollHeight,
    });

    if (options.format === "png") {
      downloadCanvas(canvas, `${options.fileName}.png`);
      return;
    }

    await downloadPdf(canvas, `${options.fileName}.pdf`, options.paperSize);
  } finally {
    exportNode.remove();
  }
}

export function openPrintView(options: Omit<ExportOptions, "format">): void {
  if (!options.text.trim()) {
    throw new Error("There is no manuscript text to print.");
  }

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new Error("The print window was blocked by the browser.");
  }

  const ink = INK_STRENGTHS[options.inkStrength];
  const escapedTitle = escapeHtml(options.title);
  const escapedText = escapeHtml(options.text);
  const sizeLabel = options.paperSize === "a4" ? "A4" : "Letter";

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapedTitle}</title>
        <style>
          @import url("https://fonts.googleapis.com/css2?family=Special+Elite&display=swap");
          @page { size: ${sizeLabel}; margin: 18mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f5f1eb;
            color: ${options.inkColor};
            font-family: "Special Elite", ui-monospace, monospace;
          }
          main {
            min-height: 100vh;
            padding: 24px;
            background: ${options.paperStyle.background};
            background-size: ${options.paperStyle.backgroundSize || "auto"};
            opacity: ${ink.opacity};
            font-weight: ${ink.fontWeight};
            text-shadow: ${ink.shadow};
            white-space: pre-wrap;
            line-height: 1.8;
            letter-spacing: 0.04em;
          }
          h1 {
            margin: 0 0 28px;
            font-size: 18px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }
          @media print {
            body { background: transparent; }
            main { padding: 0; }
          }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapedTitle}</h1>
          <div>${escapedText}</div>
        </main>
        <script>
          window.addEventListener("load", () => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function createExportNode(options: ExportOptions): HTMLElement {
  const dimensions = PAGE_DIMENSIONS[options.paperSize];
  const ink = INK_STRENGTHS[options.inkStrength];
  const node = document.createElement("article");

  node.setAttribute("aria-hidden", "true");
  Object.assign(node.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${dimensions.width}px`,
    minHeight: `${dimensions.minHeight}px`,
    padding: "76px 86px",
    border: `1px solid ${options.paperStyle.borderColor || "#e8e4df"}`,
    background: options.paperStyle.background,
    backgroundSize: options.paperStyle.backgroundSize || "auto",
    boxShadow: "none",
    color: options.inkColor,
    fontFamily: `"Special Elite", ui-monospace, monospace`,
    fontSize: "20px",
    lineHeight: "1.8",
    letterSpacing: "0.04em",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    opacity: `${ink.opacity}`,
    fontWeight: `${ink.fontWeight}`,
    textShadow: ink.shadow,
    zIndex: "-1",
  });

  const heading = document.createElement("h1");
  heading.textContent = options.title;
  Object.assign(heading.style, {
    margin: "0 0 34px",
    fontSize: "24px",
    lineHeight: "1.35",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  });

  const body = document.createElement("div");
  body.textContent = options.text;

  node.append(heading, body);
  return node;
}

function downloadCanvas(canvas: HTMLCanvasElement, fileName: string): void {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
}

async function downloadPdf(
  canvas: HTMLCanvasElement,
  fileName: string,
  paperSize: PaperSize,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: paperSize,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/png");

  let position = 0;
  let remainingHeight = imageHeight;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(fileName);
}

function downloadTextFile(
  content: string,
  fileName: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
