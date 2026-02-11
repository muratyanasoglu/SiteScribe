'use server';

import { requireProjectAccess } from '@/lib/auth-server';
import { exportCOLineItemsCSV, exportEvidenceCSV } from '@/lib/csv-export';

export async function getCOLineItemsCSV(projectId: string, changeOrderId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return exportCOLineItemsCSV(changeOrderId);
}

export async function getEvidenceCSV(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return exportEvidenceCSV(projectId);
}
