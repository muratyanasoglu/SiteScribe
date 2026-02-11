'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';

export async function getProjectDashboard(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  const [evidenceCount, eventCount, coCount, coStats] = await Promise.all([
    prisma.evidence.count({ where: { projectId } }),
    prisma.changeEvent.count({ where: { projectId } }),
    prisma.changeOrder.count({ where: { projectId } }),
    prisma.changeOrder.aggregate({
      where: { projectId },
      _sum: { scheduleImpactDays: true },
    }),
  ]);
  const lineItems = await prisma.changeOrderLineItem.findMany({
    where: { changeOrder: { projectId } },
    select: { amount: true },
  });
  const totalCost = lineItems.reduce((s, li) => s + (li.amount ?? 0), 0);
  return {
    evidenceCount,
    eventCount,
    coCount,
    totalScheduleImpactDays: coStats._sum.scheduleImpactDays ?? 0,
    totalCost,
  };
}
