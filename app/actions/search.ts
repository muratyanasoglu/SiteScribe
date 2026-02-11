'use server';

import { requireProjectAccess } from '@/lib/auth-server';
import { searchEvidenceAndCO } from '@/lib/fulltext';

export async function projectSearch(projectId: string, query: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return searchEvidenceAndCO(projectId, query, 20);
}
