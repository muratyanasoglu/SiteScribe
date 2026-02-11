'use server';

import { prisma } from '@/lib/db';
import { requireOrgRole, requireProjectAccess } from '@/lib/auth-server';
import { validateName, sanitizeDescription } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function createProject(organizationId: string, formData: FormData) {
  await requireOrgRole(organizationId, 'PM');
  const nameResult = validateName(formData.get('name'), 'Project name');
  if (!nameResult.ok) return { error: nameResult.error };
  const description = sanitizeDescription(formData.get('description')) || undefined;
  const project = await prisma.project.create({
    data: { organizationId, name: nameResult.name, description },
  });
  revalidatePath('/org');
  revalidatePath('/projects');
  return { ok: true, projectId: project.id };
}

export async function getProjects(organizationId: string) {
  await requireOrgRole(organizationId, 'VIEWER');
  return prisma.project.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(projectId: string) {
  const { project } = await requireProjectAccess(projectId, 'VIEWER');
  return prisma.project.findUniqueOrThrow({
    where: { id: project.id },
  });
}
