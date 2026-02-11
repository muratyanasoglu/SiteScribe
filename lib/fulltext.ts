/**
 * MySQL FULLTEXT search over evidence and Change Order text.
 * Run FULLTEXT index migration separately if needed (e.g. db/fulltext-index.sql).
 */

import { prisma } from '@/lib/db';

export async function searchEvidenceAndCO(projectId: string, query: string, limit = 20) {
  if (!query.trim()) return { evidence: [], changeOrders: [] };
  const like = `%${query.trim().replace(/%/g, '\\%')}%`;
  const [evidence, changeOrders] = await Promise.all([
    prisma.evidence.findMany({
      where: {
        projectId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { extractedText: { contains: query } },
        ],
      },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    }),
    prisma.changeOrder.findMany({
      where: {
        projectId,
        OR: [
          { title: { contains: query } },
          { scopeNarrative: { contains: query } },
          { contractClauses: { contains: query } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    }),
  ]);
  return { evidence, changeOrders };
}
