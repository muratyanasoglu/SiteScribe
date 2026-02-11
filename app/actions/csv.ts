'use server';

import { requireProjectAccess } from '@/lib/auth-server';
import { isValidId } from '@/lib/validation';
import { exportCOLineItemsCSV, exportEvidenceCSV } from '@/lib/csv-export';

export async function getCOLineItemsCSV(projectId: string, changeOrderId: string) {
  if (!isValidId(changeOrderId)) throw new Error('Invalid change order');
  await requireProjectAccess(projectId, 'VIEWER');
  return exportCOLineItemsCSV(changeOrderId);
}

export async function getEvidenceCSV(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return exportEvidenceCSV(projectId);
}
