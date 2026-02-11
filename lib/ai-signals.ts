/**
 * Mistral AI signal enrichment: score, reasoning, suggested type (risk, claim, delay, cost, scope_change, force_majeure).
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

export async function enrichSignalsWithAi(changeEventId: string): Promise<number> {
  if (!isAiEnabled()) return 0;
  const signals = await prisma.eventSignal.findMany({
    where: { changeEventId },
    include: { evidence: { include: { chunks: true } } },
  });
  let updated = 0;
  for (const sig of signals) {
    const text = [
      sig.evidence.extractedText,
      sig.evidence.title,
      sig.evidence.description,
      ...(sig.evidence.chunks?.map((c) => c.content) ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 3000);
    if (!text.trim()) continue;

    const result = await chat(
      [
        {
          role: 'system',
          content: `Reply ONLY with JSON: {"score": 0.0-1.0, "reason": "brief reason", "signalType": "scope_change|delay|cost|risk|claim|force_majeure|other"}. No explanation.`,
        },
        {
          role: 'user',
          content: `Is this evidence text a change/delay/extra work signal? Give 0-1 score, brief reason, and signal type.\n\n${text}`,
        },
      ],
      { maxTokens: 150, responseFormat: { type: 'json_object' } }
    );
    if (!result?.content) continue;
    try {
      const parsed = JSON.parse(result.content) as {
        score?: number;
        reason?: string;
        signalType?: string;
      };
      const signalType = parsed.signalType
        ? String(parsed.signalType).toLowerCase().replace(/\s+/g, '_')
        : null;
      const validTypes = ['scope_change', 'delay', 'cost', 'risk', 'claim', 'force_majeure', 'other'];
      const aiSignalType = signalType && validTypes.includes(signalType) ? signalType : null;
      const reason = parsed.reason ? String(parsed.reason).slice(0, 500) : undefined;
      await prisma.eventSignal.update({
        where: { id: sig.id },
        data: {
          ...(aiSignalType && { aiSignalType }),
          ...(reason && { reason }),
          ...(typeof parsed.score === 'number' && parsed.score >= 0 && parsed.score <= 1 && { score: parsed.score }),
        },
      });
      if (result.usage) {
        await logAiUsage({
          operation: 'signal_score',
          projectId: sig.evidence.projectId,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
        });
      }
      updated++;
    } catch {
      // skip
    }
  }
  return updated;
}
