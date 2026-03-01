/**
 * Generates a display title from the note's content.
 * It takes the first line, truncates it if necessary, and converts it to uppercase.
 * @param content The full content of the note.
 * @returns A formatted string for display as a title.
 */
export function formatNoteTitleForDisplay(content: string): string {
  const firstLine = content.trim().split("\n")[0] || "UNTITLED";
  const maxLength = 30;
  return firstLine.length > maxLength
    ? firstLine.slice(0, maxLength).toUpperCase() + "..."
    : firstLine.toUpperCase();
}

/**
 * Formats an ISO date string into a short, uppercase format (e.g., "OCT 28").
 * @param isoDateString The date string in ISO format.
 * @returns A formatted date string.
 */
export function formatDateForDisplay(isoDateString: string): string {
  const date = new Date(isoDateString);
  return date
    .toLocaleDateString("en-US", { day: "2-digit", month: "short" })
    .toUpperCase();
}

/**
 * Generates a default title for a new note based on the current time.
 * @returns A string like "Manuscript_14:35:12".
 */
export function generateNewNoteTitle(): string {
  return "Manuscript_" + new Date().toLocaleTimeString("en-GB"); // Use a consistent format
}
