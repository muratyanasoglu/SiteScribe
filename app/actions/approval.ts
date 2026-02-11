'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { createNotification } from '@/lib/notifications';
import { auditLog } from '@/lib/audit';
import { triggerWebhooks } from '@/lib/webhook';
import { isValidId } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function requestApproval(projectId: string, changeOrderId: string) {
  if (!isValidId(changeOrderId)) return { error: 'Invalid change order' };
  const { userId, project } = await requireProjectAccess(projectId, 'PM');
  const co = await prisma.changeOrder.findFirst({
    where: { id: changeOrderId, projectId },
    select: { title: true },
  });
  await prisma.changeOrder.update({
    where: { id: changeOrderId, projectId },
    data: { status: 'IN_REVIEW' },
  });
  await prisma.cOApproval.upsert({
    where: { changeOrderId_userId: { changeOrderId, userId } },
    create: { changeOrderId, userId, status: 'PENDING' },
    update: { status: 'PENDING', signedAt: null },
  });
  await auditLog({
    entityType: 'ChangeOrder',
    entityId: changeOrderId,
    userId,
    action: 'STATUS_CHANGE',
    changes: { status: 'IN_REVIEW' },
  });
  const org = await prisma.organization.findFirst({ where: { id: project.organizationId } });
  if (org) await triggerWebhooks(org.id, 'co.status_changed', { changeOrderId, status: 'IN_REVIEW' });
  const members = await prisma.membership.findMany({
    where: { organizationId: project.organizationId, role: { in: ['PM', 'OWNER'] }, userId: { not: userId } },
    select: { userId: true },
  });
  const link = `/projects/${projectId}/co/${changeOrderId}`;
  const title = 'CO onay bekliyor';
  const body = co ? `${co.title} has been submitted for review.` : undefined;
  for (const m of members) {
    await createNotification({ userId: m.userId, type: 'CO_PENDING', title, body, link });
  }
  revalidatePath(`/projects/${projectId}/co/${changeOrderId}`);
  return { ok: true };
}

export async function approveOrReject(projectId: string, changeOrderId: string, status: 'APPROVED' | 'REJECTED', note?: string) {
  if (!isValidId(changeOrderId)) return { error: 'Invalid change order' };
  const allowed = status === 'APPROVED' || status === 'REJECTED';
  if (!allowed) return { error: 'Invalid status' };
  const { userId } = await requireProjectAccess(projectId, 'PM');
  await prisma.cOApproval.updateMany({
    where: { changeOrderId, userId },
    data: { status, signedAt: new Date(), note },
  });
  await prisma.changeOrder.update({
    where: { id: changeOrderId, projectId },
    data: { status },
  });
  await auditLog({
    entityType: 'ChangeOrder',
    entityId: changeOrderId,
    userId,
    action: 'STATUS_CHANGE',
    changes: { status, note },
  });
  revalidatePath(`/projects/${projectId}/co/${changeOrderId}`);
  return { ok: true };
}
