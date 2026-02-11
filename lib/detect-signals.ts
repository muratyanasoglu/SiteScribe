/**
 * Heuristic MVP: detect potential change signals from recent evidence.
 * Keyword triggers in logs/RFI; plan revision upload = revision signal.
 */

import { prisma } from '@/lib/db';

const KEYWORDS = [
  'changed',
  'revision',
  'rfi',
  'delay',
  'additional',
  'unforeseen',
  'change order',
  'scope change',
  'extra work',
  'directive',
];

const RECENT_DAYS = 30;

export async function detectChangeSignals(projectId: string): Promise<{ eventId: string; eventIds: string[]; signals: number }> {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_DAYS);

  const evidence = await prisma.evidence.findMany({
    where: { projectId, occurredAt: { gte: since } },
    include: { chunks: true },
    orderBy: { occurredAt: 'asc' },
  });

  const signalsByGroup: Map<string, { score: number; reasons: string[]; evidenceIds: Set<string> }> = new Map();

  for (const ev of evidence) {
    const text = [ev.extractedText, ev.title, ev.description].filter(Boolean).join(' ').toLowerCase();
    const reasons: string[] = [];
    let score = 0;

    if (ev.type === 'PLAN_REVISION') {
      reasons.push('Plan revision upload');
      score = 0.9;
    }
    if (ev.type === 'RFI_DOC') {
      reasons.push('RFI document');
      score = Math.max(score, 0.7);
    }
    for (const kw of KEYWORDS) {
      if (text.includes(kw)) {
        reasons.push(`Keyword: "${kw}"`);
        score = Math.min(1, score + 0.2);
      }
    }
    // Structured signals: delay in days, cost/amount mentioned (TR/EN keywords)
    const daysMatch = text.match(/(\d+)\s*(gün|day|days|gun)\s*(gecikme|delay|delay)/i) || text.match(/(gecikme|delay).*?(\d+)\s*(gün|day)/i);
    if (daysMatch) {
      reasons.push('Schedule impact (days mentioned)');
      score = Math.min(1, score + 0.25);
    }
    const costMatch = text.match(/(ek\s*maliyet|additional\s*cost|extra\s*cost|tutar|amount|[\d.,]+\s*(tl|usd|eur|₺|\$|€))/i);
    if (costMatch) {
      reasons.push('Cost/amount mentioned');
      score = Math.min(1, score + 0.2);
    }

    if (score <= 0) continue;

    const key = `${ev.occurredAt.toISOString().slice(0, 10)}-${ev.type}`;
    if (!signalsByGroup.has(key)) {
      signalsByGroup.set(key, { score: 0, reasons: [], evidenceIds: new Set() });
    }
    const g = signalsByGroup.get(key)!;
    g.score = Math.min(1, g.score + score * 0.5);
    g.reasons.push(...reasons);
    g.evidenceIds.add(ev.id);
  }

  if (signalsByGroup.size === 0) {
    const fallbackEvent = await prisma.changeEvent.create({
      data: {
        projectId,
        title: 'No signals detected',
        description: 'Run again after adding more evidence.',
        status: 'DETECTED',
        occurredAt: new Date(),
      },
    });
    return { eventId: fallbackEvent.id, eventIds: [fallbackEvent.id], signals: 0 };
  }

  const createdEventIds: string[] = [];
  for (const [key, g] of Array.from(signalsByGroup)) {
    const [dateStr] = key.split('-');
    const event = await prisma.changeEvent.create({
      data: {
        projectId,
        title: `Change signal: ${dateStr}`,
        description: g.reasons.slice(0, 5).join('; '),
        status: 'DETECTED',
        occurredAt: new Date(dateStr),
      },
    });
    createdEventIds.push(event.id);
    for (const evidenceId of g.evidenceIds) {
      await prisma.eventSignal.create({
        data: {
          changeEventId: event.id,
          evidenceId,
          score: g.score,
          reason: g.reasons.slice(0, 3).join('; '),
        },
      });
    }
  }

  const count = await prisma.eventSignal.count({
    where: { changeEvent: { projectId } },
  });
  const lastId = createdEventIds[createdEventIds.length - 1] ?? '';
  return { eventId: lastId, eventIds: createdEventIds, signals: count };
}
