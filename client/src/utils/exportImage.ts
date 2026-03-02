import html2canvas from "html2canvas";

/**
 * Captures a DOM element and downloads it as a PNG image.
 * @param elementId The ID of the element to capture (the paper sheet).
 * @param fileName The name of the resulting file.
 */
export const downloadComponentAsImage = async (
  elementId: string,
  fileName: string,
) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Keeps transparency if needed
      scale: 2, // Higher resolution for better text quality
      logging: false,
      useCORS: true, // Important for external fonts/styles
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `${fileName}.png`;
    link.click();
  } catch (error) {
    console.error("Export failed:", error);
  }
};
