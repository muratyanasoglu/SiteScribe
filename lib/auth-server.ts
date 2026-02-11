import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import type { Membership } from '@prisma/client';
import { isValidId } from '@/lib/validation';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, username: true },
  });
  return user;
}

/** Get membership for an org; enforces org isolation. */
export async function getMembership(organizationId: string): Promise<{ role: Role; membership: Membership } | null> {
  if (!isValidId(organizationId)) return null;
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: { organizationId, userId: user.id },
    },
  });
  if (!membership) return null;
  return { role: membership.role, membership };
}

/** Ensure user is in org and has at least the given role. Throws if not. */
export async function requireOrgRole(organizationId: string, minimumRole: Role): Promise<{ userId: string; role: Role }> {
  if (!isValidId(organizationId)) throw new Error('Forbidden');
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  const m = await getMembership(organizationId);
  if (!m) throw new Error('Forbidden: not a member of this organization');
  const order: Role[] = ['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM', 'OWNER'];
  if (order.indexOf(m.role) < order.indexOf(minimumRole)) {
    throw new Error('Forbidden: insufficient role');
  }
  return { userId: user.id, role: m.role };
}

/** Ensure user has access to project (via org). Returns project and role. */
export async function requireProjectAccess(
  projectId: string,
  minimumRole: Role
): Promise<{ userId: string; role: Role; project: { id: string; organizationId: string } }> {
  if (!isValidId(projectId)) throw new Error('Not found');
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, organizationId: true },
  });
  if (!project) throw new Error('Not found');
  const { role } = await requireOrgRole(project.organizationId, minimumRole);
  return { userId: user.id, role, project };
}
