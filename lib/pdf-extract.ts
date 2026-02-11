/**
 * Extract text from PDF buffer. Uses pdf-parse (lightweight).
 * If extraction fails or is empty, we still keep the evidence (file included in exports).
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return (data?.text || '').trim();
  } catch {
    return '';
  }
}

/** Chunk text for EvidenceChunk (simple by paragraph/size). */
const CHUNK_SIZE = 1000;
const OVERLAP = 100;

export function chunkText(text: string): string[] {
  if (!text.trim()) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end).trim());
    start = end - (end < text.length ? OVERLAP : 0);
  }
  return chunks.filter(Boolean);
}
