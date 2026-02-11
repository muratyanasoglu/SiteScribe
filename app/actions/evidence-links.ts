'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

export async function getEvidenceLinks(projectId: string) {
  await requireProjectAccess(projectId, 'VIEWER');
  return prisma.evidenceLink.findMany({
    where: { projectId },
    include: {
      fromEvidence: true,
      toEvidence: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createEvidenceLink(projectId: string, fromId: string, toId: string, linkType?: string) {
  await requireProjectAccess(projectId, 'FIELD');
  await prisma.evidenceLink.create({
    data: { projectId, fromId, toId, linkType: linkType || null },
  });
  revalidatePath(`/projects/${projectId}/evidence`);
  revalidatePath(`/projects/${projectId}/evidence/links`);
  return { ok: true };
}
