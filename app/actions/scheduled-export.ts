'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canExport } from '@/lib/rbac';
import { isValidId } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function listScheduledExports(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.scheduledExport.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { name: true } } },
  });
}

export async function createScheduledExport(
  projectId: string,
  data: { changeOrderId?: string; cron: string; notificationEmail?: string }
) {
  const { role } = await requireProjectAccess(projectId, 'PM');
  if (!canExport(role)) return { error: 'Forbidden' };
  const changeOrderId = data.changeOrderId?.trim();
  if (changeOrderId != null && changeOrderId !== '' && !isValidId(changeOrderId)) return { error: 'Invalid change order' };
  const cron = (data.cron || '0 9 * * 1').trim(); // default: her Pazartesi 09:00
  await prisma.scheduledExport.create({
    data: {
      projectId,
      changeOrderId: changeOrderId || null,
      cron,
      enabled: true,
      notificationEmail: data.notificationEmail?.trim() || null,
    },
  });
  revalidatePath(`/projects/${projectId}/scheduled-exports`);
  return { ok: true };
}

export async function deleteScheduledExport(projectId: string, scheduledExportId: string) {
  if (!isValidId(scheduledExportId)) return { error: 'Invalid schedule' };
  await requireProjectAccess(projectId, 'PM');
  await prisma.scheduledExport.deleteMany({
    where: { id: scheduledExportId, projectId },
  });
  revalidatePath(`/projects/${projectId}/scheduled-exports`);
  return { ok: true };
}

export async function toggleScheduledExport(
  projectId: string,
  scheduledExportId: string,
  enabled: boolean
) {
  if (!isValidId(scheduledExportId)) return { error: 'Invalid schedule' };
  await requireProjectAccess(projectId, 'PM');
  await prisma.scheduledExport.updateMany({
    where: { id: scheduledExportId, projectId },
    data: { enabled },
  });
  revalidatePath(`/projects/${projectId}/scheduled-exports`);
  return { ok: true };
}
