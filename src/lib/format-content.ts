/**
 * Preprocesses lesson/step content for clean ReactMarkdown rendering.
 * Converts literal \n sequences to actual newlines and cleans up formatting artifacts.
 */
export function formatContent(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // Convert literal \n sequences to actual newlines
    .replace(/\\n/g, "\n")
    // Remove excessive blank lines (3+ → 2)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
