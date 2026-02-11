/**
 * Mistral AI for evidence: summary, type classification, title/description suggestions.
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

const EVIDENCE_TYPES = ['SITE_LOG', 'PHOTO', 'RFI_DOC', 'PLAN_REVISION', 'CONTRACT'] as const;

export async function generateEvidenceSummary(evidenceId: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const ev = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { chunks: true },
  });
  if (!ev) return null;
  const text = ev.extractedText || ev.chunks?.map((c) => c.content).join('\n') || ev.title || '';
  if (!text.trim()) return null;

  const result = await chat(
    [
      {
        role: 'system',
        content:
          'You are a construction project document summarizer. Summarize the given text in 2-3 sentences. Return only the summary text, no other explanation.',
      },
      { role: 'user', content: text.slice(0, 6000) },
    ],
    { maxTokens: 300 }
  );
  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'evidence_summary',
      projectId: ev.projectId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content.trim().slice(0, 1000);
}

export async function suggestEvidenceType(evidenceId: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const ev = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { chunks: true },
  });
  if (!ev) return null;
  const text = (ev.extractedText || ev.chunks?.map((c) => c.content).join('\n') || ev.title || '').slice(0, 3000);
  if (!text.trim()) return null;

  const result = await chat(
    [
      {
        role: 'system',
        content: `Return only one of these words: SITE_LOG, PHOTO, RFI_DOC, PLAN_REVISION, CONTRACT. No explanation.`,
      },
      {
        role: 'user',
        content: `Which evidence type does this text match? (site log, photo, RFI document, plan revision, contract)\n\n${text}`,
      },
    ],
    { maxTokens: 20 }
  );
  if (!result?.content) return null;
  const suggested = result.content.trim().toUpperCase().replace(/-/g, '_');
  if (EVIDENCE_TYPES.includes(suggested as (typeof EVIDENCE_TYPES)[number])) {
    if (result.usage) {
      await logAiUsage({
        operation: 'evidence_classify',
        projectId: ev.projectId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    }
    return suggested;
  }
  return null;
}

export async function suggestTitleAndDescription(evidenceId: string): Promise<{ title: string; description: string } | null> {
  if (!isAiEnabled()) return null;
  const ev = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { chunks: true },
  });
  if (!ev) return null;
  const text = (ev.extractedText || ev.chunks?.map((c) => c.content).join('\n') || '').slice(0, 4000);
  if (!text.trim()) return null;

  const result = await chat(
    [
      {
        role: 'system',
        content:
          'Reply ONLY with JSON: {"title":"short title","description":"1-2 sentence description"}. No other text.',
      },
      { role: 'user', content: `Suggest a short title and description for this text:\n\n${text}` },
    ],
    { maxTokens: 200, responseFormat: { type: 'json_object' } }
  );
  if (!result?.content) return null;
  try {
    const parsed = JSON.parse(result.content) as { title?: string; description?: string };
    if (result.usage) {
      await logAiUsage({
        operation: 'evidence_suggest_fields',
        projectId: ev.projectId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    }
    return {
      title: String(parsed.title ?? '').slice(0, 200),
      description: String(parsed.description ?? '').slice(0, 500),
    };
  } catch {
    return null;
  }
}
