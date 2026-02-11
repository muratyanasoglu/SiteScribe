'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canTriageSignals } from '@/lib/rbac';
import { detectChangeSignals } from '@/lib/detect-signals';
import { enrichSignalsWithAi } from '@/lib/ai-signals';
import { createNotification } from '@/lib/notifications';
import { isValidId } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function runDetection(projectId: string) {
  const { userId, role, project } = await requireProjectAccess(projectId, 'PM');
  if (!canTriageSignals(role)) return { error: 'Forbidden' };
  const result = await detectChangeSignals(projectId);
  const eventIds = (result as { eventIds?: string[] }).eventIds ?? ((result as { eventId?: string }).eventId ? [(result as { eventId: string }).eventId] : []);
  for (const eventId of eventIds) {
    try {
      await enrichSignalsWithAi(eventId);
    } catch {
      // AI enrichment optional
    }
  }
  if (!(result as { error?: string }).error && (result as { signals?: number }).signals !== undefined) {
    const members = await prisma.membership.findMany({
      where: { organizationId: project.organizationId, role: { in: ['PM', 'OWNER', 'FIELD'] } },
      select: { userId: true },
    });
    const link = `/projects/${projectId}/signals`;
    const title = 'New signals detected';
    const body = `${(result as { signals: number }).signals} signal(s) updated.`;
    for (const m of members) {
      if (m.userId === userId) continue;
      await createNotification({ userId: m.userId, type: 'NEW_SIGNAL', title, body, link });
    }
  }
  revalidatePath(`/projects/${projectId}/signals`);
  revalidatePath(`/projects/${projectId}/events`);
  return result;
}

export async function listEvents(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.changeEvent.findMany({
    where: { projectId },
    orderBy: { occurredAt: 'desc' },
    include: {
      signals: { include: { evidence: true } },
      changeOrders: { take: 1 },
    },
  });
}

export async function getEvent(projectId: string, eventId: string) {
  if (!isValidId(eventId)) throw new Error('Not found');
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.changeEvent.findFirstOrThrow({
    where: { id: eventId, projectId },
    include: {
      signals: { include: { evidence: true } },
      changeOrders: true,
      comments: true,
    },
  });
}

export async function updateEventStatus(projectId: string, eventId: string, status: string) {
  if (!isValidId(eventId)) return { error: 'Invalid event' };
  const { role } = await requireProjectAccess(projectId, 'PM');
  if (!canTriageSignals(role)) return { error: 'Forbidden' };
  await prisma.changeEvent.update({
    where: { id: eventId, projectId },
    data: { status },
  });
  revalidatePath(`/projects/${projectId}/signals`);
  revalidatePath(`/projects/${projectId}/events/${eventId}`);
}
