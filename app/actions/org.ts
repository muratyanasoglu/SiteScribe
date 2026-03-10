'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser, requireOrgRole } from '@/lib/auth-server';
import { validateName, validateSlug, sanitizeDescription } from '@/lib/validation';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import type { Organization } from '@prisma/client';

export async function createOrganization(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  const nameResult = validateName(formData.get('name'), 'Organization name');
  if (!nameResult.ok) return { error: nameResult.error };
  const slugInput = formData.get('slug') || nameResult.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const slugResult = validateSlug(slugInput);
  if (!slugResult.ok) return { error: slugResult.error };
  const org = await prisma.organization.create({
    data: {
      name: nameResult.name,
      slug: slugResult.slug,
      orgChatRoom: { create: {} },
    },
  });
  await prisma.membership.create({
    data: { organizationId: org.id, userId: user.id, role: 'OWNER' },
  });
  revalidatePath('/org');
  revalidatePath('/org/chat');
  return { ok: true, orgId: org.id };
}

export async function getOrganizations(): Promise<{ org: Organization; role: Role }[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { organization: true },
  });
  return memberships.map((m) => ({ org: m.organization, role: m.role }));
}

export async function inviteMember(organizationId: string, email: string, role: Role) {
  await requireOrgRole(organizationId, 'OWNER');
  // Invite flow: lookup user by email, create invitation record; user accepts via link. See invite actions.
  revalidatePath('/org');
  return { error: 'Invite not implemented in MVP; add user manually via seed or DB.' };
}
