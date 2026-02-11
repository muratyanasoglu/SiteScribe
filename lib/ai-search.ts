/**
 * Semantic search via Mistral embeddings over evidence and CO text (natural-language queries).
 */

import { prisma } from '@/lib/db';
import { embedOne, cosineSimilarity, isAiEnabled } from '@/lib/ai-mistral';

const MAX_RESULTS = 20;

export type SemanticSearchHit = {
  evidenceId: string;
  evidenceTitle: string | null;
  type: string;
  occurredAt: Date;
  score: number;
  snippet: string;
};

export async function semanticSearch(
  projectId: string,
  query: string,
  options?: { limit?: number }
): Promise<SemanticSearchHit[]> {
  if (!isAiEnabled() || !query.trim()) return [];

  const limit = Math.min(options?.limit ?? MAX_RESULTS, 50);
  const queryEmbedding = await embedOne(query.trim());
  if (!queryEmbedding) return [];

  const evidence = await prisma.evidence.findMany({
    where: { projectId },
    select: {
      id: true,
      title: true,
      type: true,
      occurredAt: true,
      aiEmbedding: true,
      extractedText: true,
      aiSummary: true,
    },
  });

  const withEmbedding = evidence.filter((e) => e.aiEmbedding && Array.isArray(e.aiEmbedding));
  if (withEmbedding.length === 0) return [];

  const scored = withEmbedding.map((e) => {
    const emb = e.aiEmbedding as number[];
    const score = cosineSimilarity(queryEmbedding, emb);
    const snippet =
      (e.aiSummary as string) ||
      (e.extractedText ? String(e.extractedText).slice(0, 200) + '…' : e.title || '') ||
      '';
    return {
      evidenceId: e.id,
      evidenceTitle: e.title,
      type: e.type,
      occurredAt: e.occurredAt,
      score,
      snippet: snippet.slice(0, 300),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

/** Generates and stores embeddings for evidence (batch or single). */
export async function embedEvidence(evidenceId: string): Promise<boolean> {
  if (!isAiEnabled()) return false;
  const ev = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { chunks: true },
  });
  if (!ev) return false;
  const text = ev.aiSummary || ev.extractedText || ev.chunks?.map((c) => c.content).join('\n') || ev.title || '';
  if (!text.trim()) return false;

  const { embedOne } = await import('@/lib/ai-mistral');
  const vector = await embedOne(text.slice(0, 8000));
  if (!vector) return false;

  await prisma.evidence.update({
    where: { id: evidenceId },
    data: { aiEmbedding: vector },
  });
  return true;
}
