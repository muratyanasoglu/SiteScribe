/**
 * Mistral-powered CO draft: structured JSON output, cost/schedule inference, TR/EN support, [EVID:...] citations.
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

export type CODraftLLMResult = {
  scopeNarrative: string;
  contractClauses: string;
  assumptions: string;
  costEstimate: string | null;
  scheduleImpactDays: number | null;
  citations: string[];
};

export async function generateWithLLM(
  changeEventId: string,
  options?: { language?: 'tr' | 'en' }
): Promise<CODraftLLMResult | null> {
  if (!isAiEnabled()) return null;

  const event = await prisma.changeEvent.findUniqueOrThrow({
    where: { id: changeEventId },
    include: {
      signals: { include: { evidence: { include: { chunks: true } } } },
      project: { select: { organizationId: true } },
    },
  });

  const lang = options?.language ?? 'en';
  const citations: string[] = [];
  const chunksWithMeta: { text: string; cite: string; evidenceTitle: string; occurredAt: string }[] = [];

  for (const sig of event.signals) {
    const ev = sig.evidence;
    if (!ev.chunks?.length) continue;
    const evidenceTitle = ev.title || 'Untitled';
    const occurredAt = ev.occurredAt ? new Date(ev.occurredAt).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US') : '';
    for (let i = 0; i < ev.chunks.length; i++) {
      const cite = `[EVID:${ev.id}#chunk:${i}]`;
      citations.push(cite);
      chunksWithMeta.push({
        text: ev.chunks[i].content.slice(0, 800),
        cite,
        evidenceTitle,
        occurredAt,
      });
    }
  }

  const context = chunksWithMeta
    .map((c) => `${c.cite} (${c.evidenceTitle}, ${c.occurredAt})\n${c.text}`)
    .join('\n\n');

  const langInstruction =
    lang === 'tr'
      ? 'Yanıtları Türkçe yaz. Kanıt referanslarını [EVID:id#chunk:i] formatında bırak.'
      : 'Write responses in English. Keep evidence references in [EVID:id#chunk:i] format.';

  const prompt =
    lang === 'tr'
      ? `Aşağıdaki kanıt parçalarına dayanarak bir Change Order taslağı için JSON üret. Her alanı doldur. costEstimate ve scheduleImpactDays sadece metinden çıkarılabiliyorsa doldur (ör. "+15.000 TL", 7 gün), yoksa null bırak.\n\n${context}`
      : `Based on the evidence chunks below, produce JSON for a Change Order draft. Fill each field. Set costEstimate and scheduleImpactDays only if extractable from text (e.g. "+15,000 USD", 7 days), otherwise null.\n\n${context}`;

  const systemPrompt = `You are a construction project Change Order writing assistant. Reply ONLY with JSON in the format below, no other text.
{
  "scopeNarrative": "string - brief scope narrative with [EVID:...] references",
  "contractClauses": "string - summary of relevant contract clauses with references",
  "assumptions": "string - assumptions (bullet points)",
  "costEstimate": "string | null - estimated additional cost (with currency) or null",
  "scheduleImpactDays": number | null - estimated delay (days) or null
}
${langInstruction}`;

  const result = await chat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    { maxTokens: 2000, responseFormat: { type: 'json_object' } }
  );

  if (!result?.content) return null;

  try {
    const parsed = JSON.parse(result.content) as {
      scopeNarrative?: string;
      contractClauses?: string;
      assumptions?: string;
      costEstimate?: string | null;
      scheduleImpactDays?: number | null;
    };
    if (result.usage) {
      await logAiUsage({
        operation: 'co_draft',
        projectId: event.projectId,
        organizationId: event.project?.organizationId ?? undefined,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    }
    return {
      scopeNarrative: String(parsed.scopeNarrative ?? '').slice(0, 4000),
      contractClauses: String(parsed.contractClauses ?? '').slice(0, 3000),
      assumptions: String(parsed.assumptions ?? '').slice(0, 2000),
      costEstimate: parsed.costEstimate ? String(parsed.costEstimate).slice(0, 200) : null,
      scheduleImpactDays:
        typeof parsed.scheduleImpactDays === 'number' && Number.isFinite(parsed.scheduleImpactDays)
          ? parsed.scheduleImpactDays
          : null,
      citations,
    };
  } catch {
    return null;
  }
}
