/**
 * Mistral RAG: project or CO context chat using evidence chunks and CO text.
 */

import { prisma } from '@/lib/db';
import { chat, isAiEnabled, logAiUsage } from '@/lib/ai-mistral';

function buildContextFromChunks(chunks: { content: string; evidenceId: string }[], maxChars: number): string {
  let s = '';
  for (const c of chunks) {
    if (s.length + c.content.length > maxChars) break;
    s += `[EVID:${c.evidenceId}]\n${c.content.slice(0, 1500)}\n\n`;
  }
  return s;
}

export async function projectChat(
  projectId: string,
  userMessage: string,
  options?: { coId?: string }
): Promise<string | null> {
  if (!isAiEnabled() || !userMessage.trim()) return null;

  const [evidence, co] = await Promise.all([
    prisma.evidence.findMany({
      where: { projectId },
      include: { chunks: true },
      orderBy: { occurredAt: 'desc' },
      take: 30,
    }),
    options?.coId
      ? prisma.changeOrder.findFirst({
          where: { id: options.coId, projectId },
          select: { title: true, scopeNarrative: true, contractClauses: true, assumptions: true },
        })
      : null,
  ]);

  const chunks: { content: string; evidenceId: string }[] = [];
  for (const ev of evidence) {
    for (const ch of ev.chunks || []) {
      chunks.push({ content: ch.content, evidenceId: ev.id });
    }
  }
  const contextEvidence = buildContextFromChunks(chunks, 6000);
  let contextCo = '';
  if (co) {
    contextCo = `\n\nChange Order: ${co.title}\nScope: ${(co.scopeNarrative || '').slice(0, 2000)}\nContract: ${(co.contractClauses || '').slice(0, 1000)}`;
  }

  const systemPrompt = `You are a construction project Change Order assistant. Answer only based on the given evidence and CO text. Do not make up anything you don't know. Use references in [EVID:id] format. Be brief and clear.`;

  const result = await chat(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Context (evidence chunks and CO):\n${contextEvidence}${contextCo}\n\nUser question: ${userMessage}`,
      },
    ],
    { maxTokens: 800 }
  );

  if (!result?.content) return null;
  if (result.usage) {
    await logAiUsage({
      operation: 'chat',
      projectId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });
  }
  return result.content;
}
