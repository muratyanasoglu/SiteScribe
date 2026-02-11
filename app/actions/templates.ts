'use server';

import { prisma } from '@/lib/db';
import { requireOrgRole, requireProjectAccess } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

export async function listTemplates(organizationId: string) {
  await requireOrgRole(organizationId, 'VIEWER');
  return prisma.cOTemplate.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createTemplate(organizationId: string, formData: FormData) {
  await requireOrgRole(organizationId, 'PM');
  const name = formData.get('name') as string;
  const scopeBody = (formData.get('scopeBody') as string) || null;
  const lineItemsStr = formData.get('lineItemsJson') as string | null;
  let lineItemsJson: object | null = null;
  if (lineItemsStr) {
    try {
      lineItemsJson = JSON.parse(lineItemsStr) as object;
    } catch {}
  }
  await prisma.cOTemplate.create({
    data: { organizationId, name, scopeBody, lineItemsJson: lineItemsJson ?? undefined },
  });
  revalidatePath('/org');
  return { ok: true };
}

export async function deleteTemplate(organizationId: string, templateId: string) {
  await requireOrgRole(organizationId, 'PM');
  await prisma.cOTemplate.deleteMany({
    where: { id: templateId, organizationId },
  });
  revalidatePath('/org');
  return { ok: true };
}

/** List CO templates belonging to the project's organization. */
export async function listTemplatesForProject(projectId: string) {
  const { project } = await requireProjectAccess(projectId, 'VIEWER');
  return listTemplates(project.organizationId);
}
