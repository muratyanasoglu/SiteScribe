/**
 * Mistral: plan revision comparison summary, contract compliance check, risk level.
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

export async function getPlanRevisionSummary(textA: string, textB: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const combined = `Text A (first 3000 chars):\n${textA.slice(0, 3000)}\n\nText B (first 3000 chars):\n${textB.slice(0, 3000)}`;

  const result = await chat(
    [
      {
        role: 'system',
        content:
          'Compare the two plan texts. Summarize changed items or revision notes in 5-10 sentences. Use English.',
      },
      { role: 'user', content: combined },
    ],
    { maxTokens: 500 }
  );
  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'plan_compare',
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content;
}

export async function getContractComplianceSummary(
  projectId: string,
  coScopeNarrative: string
): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const contracts = await prisma.evidence.findMany({
    where: { projectId, type: 'CONTRACT' },
    include: { chunks: true },
    take: 5,
  });
  const contractText = contracts
    .map((e) => e.chunks?.map((c) => c.content).join('\n') || e.extractedText || '')
    .join('\n\n')
    .slice(0, 6000);
  if (!contractText.trim()) return null;

  const result = await chat(
    [
      {
        role: 'system',
        content:
          'Briefly assess whether the CO scope text is consistent with contract clauses. Note any conflicts or missing references. Use English, 3-5 sentences.',
      },
      {
        role: 'user',
        content: `Contract text:\n${contractText}\n\nCO scope text:\n${coScopeNarrative.slice(0, 2000)}`,
      },
    ],
    { maxTokens: 400 }
  );
  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'contract_compliance',
      projectId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content;
}

export async function getRiskLevel(projectId: string, coId: string): Promise<'LOW' | 'MEDIUM' | 'HIGH' | null> {
  if (!isAiEnabled()) return null;
  const co = await prisma.changeOrder.findFirst({
    where: { id: coId, projectId },
    select: { scopeNarrative: true, assumptions: true, aiCostEstimate: true, scheduleImpactDays: true },
  });
  if (!co) return null;

  const text = `Scope: ${(co.scopeNarrative || '').slice(0, 1500)}\nAssumptions: ${(co.assumptions || '').slice(0, 500)}\nCost estimate: ${co.aiCostEstimate || '-'}\nDelay (days): ${co.scheduleImpactDays ?? '-'}`;

  const result = await chat(
    [
      {
        role: 'system',
        content: 'Return only one of these words: LOW, MEDIUM, HIGH. No explanation.',
      },
      {
        role: 'user',
        content: `What is the delay/cost risk level for this CO (low/medium/high)?\n\n${text}`,
      },
    ],
    { maxTokens: 10 }
  );
  if (!result?.content) return null;
  const level = result.content.trim().toUpperCase();
  if (level === 'LOW' || level === 'MEDIUM' || level === 'HIGH') {
    if (result.usage) {
      await logAiUsage({
        operation: 'risk_level',
        projectId,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    }
    return level;
  }
  return null;
}
