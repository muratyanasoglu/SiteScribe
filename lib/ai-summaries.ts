/**
 * Mistral: dashboard summary and pending-approval CO summary.
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

export async function getDashboardSummary(projectId: string, days = 7): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [evidence, events, cos] = await Promise.all([
    prisma.evidence.findMany({
      where: { projectId, createdAt: { gte: since } },
      select: { title: true, type: true, occurredAt: true },
      orderBy: { occurredAt: 'desc' },
      take: 20,
    }),
    prisma.changeEvent.findMany({
      where: { projectId, createdAt: { gte: since } },
      select: { title: true, status: true },
      take: 10,
    }),
    prisma.changeOrder.findMany({
      where: { projectId },
      select: { title: true, status: true },
      take: 10,
    }),
  ]);

  const text = `Last ${days} days evidence: ${evidence.map((e) => `${e.type} ${e.title || ''}`).join('; ')}
Events: ${events.map((e) => `${e.title} (${e.status})`).join('; ')}
COs: ${cos.map((c) => `${c.title} (${c.status})`).join('; ')}`;

  const result = await chat(
    [
      {
        role: 'system',
        content: 'Write the summary in 3-5 sentences in English. Highlight project status and recent activity.',
      },
      { role: 'user', content: text },
    ],
    { maxTokens: 300 }
  );
  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'dashboard_summary',
      projectId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content;
}

export async function getApprovalSummary(changeOrderId: string): Promise<string | null> {
  if (!isAiEnabled()) return null;
  const co = await prisma.changeOrder.findFirst({
    where: { id: changeOrderId },
    include: { changeEvent: true },
  });
  if (!co) return null;

  const text = `CO: ${co.title}\nScope: ${(co.scopeNarrative || '').slice(0, 1500)}\nAssumptions: ${(co.assumptions || '').slice(0, 500)}`;

  const result = await chat(
    [
      {
        role: 'system',
        content: 'Write a 2-3 sentence summary and key points for the person approving this CO. Use English.',
      },
      { role: 'user', content: text },
    ],
    { maxTokens: 250 }
  );
  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'approval_summary',
      projectId: co.projectId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content;
}
