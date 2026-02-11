'use server';

import { requireProjectAccess } from '@/lib/auth-server';
import { getAuditLog, getAuditLogForProject } from '@/lib/audit';

export async function getCOAuditLog(projectId: string, changeOrderId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return getAuditLog('ChangeOrder', changeOrderId);
}

export async function getProjectAuditLog(projectId: string, limit = 30) {
  await requireProjectAccess(projectId, 'VIEWER');
  return getAuditLogForProject(projectId, limit);
}
