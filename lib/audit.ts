/**
 * Audit log: records changes to Change Orders and other key entities (who, when, what).
 */

import { prisma } from '@/lib/db';

export async function auditLog(params: {
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  changes?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      action: params.action,
      changesJson: params.changes ? (params.changes as object) : undefined,
    },
  });
}

export async function getAuditLog(entityType: string, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

/** Fetches merged audit log entries for all COs in the project (last N entries). */
export async function getAuditLogForProject(projectId: string, limit = 30) {
  const coIds = await prisma.changeOrder.findMany({
    where: { projectId },
    select: { id: true },
  });
  const ids = coIds.map((c) => c.id);
  if (ids.length === 0) return [];
  const logs = await prisma.auditLog.findMany({
    where: { entityType: 'ChangeOrder', entityId: { in: ids } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return logs;
}
