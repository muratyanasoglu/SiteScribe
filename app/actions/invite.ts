'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { requireOrgRole } from '@/lib/auth-server';
import { isValidId } from '@/lib/validation';
import { createNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

const INVITE_EXPIRY_DAYS = 7;
const ALLOWED_ROLES = ['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM'] as const;

export async function acceptInvite(token: string) {
  const tokenResult = (await import('@/lib/validation')).validateInviteToken(token);
  if (!tokenResult.ok) return { error: tokenResult.error };
  const inv = await prisma.invitation.findUnique({
    where: { token: tokenResult.token },
    include: { organization: true },
  });
  if (!inv || inv.expiresAt < new Date()) return { error: 'Invalid or expired invite' };
  const user = await prisma.user.findUnique({ where: { email: inv.email } });
  if (!user) return { error: 'User not found. Please register first with: ' + inv.email };
  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: inv.organizationId, userId: user.id } },
    create: { organizationId: inv.organizationId, userId: user.id, role: inv.role },
    update: { role: inv.role },
  });
  await prisma.invitation.delete({ where: { id: inv.id } });
  revalidatePath('/org');
  return { ok: true, organizationId: inv.organizationId };
}

/** List pending invitations for the organization (OWNER only). */
export async function listInvitations(organizationId: string) {
  await requireOrgRole(organizationId, 'OWNER');
  return prisma.invitation.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Invite a registered user (friend) to the organization. In-app only: creates invitation and notifies the user; no email. */
export async function inviteMemberByFriendId(organizationId: string, friendUserId: string, role: string) {
  await requireOrgRole(organizationId, 'OWNER');
  if (!isValidId(friendUserId)) return { error: 'Invalid user' };
  const roleTrimmed = typeof role === 'string' ? role.trim().toUpperCase() : '';
  if (!ALLOWED_ROLES.includes(roleTrimmed as typeof ALLOWED_ROLES[number])) return { error: 'Invalid role' };
  const friend = await prisma.user.findUnique({
    where: { id: friendUserId },
    select: { email: true },
  });
  if (!friend) return { error: 'User not found' };
  const existingMember = await prisma.membership.findUnique({
    where: { organizationId_userId: { organizationId, userId: friendUserId } },
  });
  if (existingMember) return { error: 'Already a member' };
  const existingInvite = await prisma.invitation.findFirst({
    where: { organizationId, email: friend.email },
  });
  if (existingInvite) return { error: 'Invitation already sent to this user' };

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  await prisma.invitation.create({
    data: {
      organizationId,
      email: friend.email,
      role: roleTrimmed as 'VIEWER' | 'SUBCONTRACTOR' | 'FIELD' | 'PM',
      token,
      expiresAt,
    },
  });
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const acceptPath = `/invite/accept?token=${token}`;
  await createNotification({
    userId: friendUserId,
    type: 'INVITATION',
    title: `Invitation to ${org.name}`,
    body: `You've been invited to join ${org.name} as ${roleTrimmed}. Open Organizations to accept.`,
    link: acceptPath,
  });
  revalidatePath('/org');
  return { ok: true };
}

/** Revoke/cancel an invitation (OWNER only). */
export async function revokeInvitation(organizationId: string, invitationId: string) {
  await requireOrgRole(organizationId, 'OWNER');
  if (!(await import('@/lib/validation')).isValidId(invitationId)) return { error: 'Invalid invitation' };
  await prisma.invitation.deleteMany({
    where: { id: invitationId, organizationId },
  });
  revalidatePath('/org');
  return { ok: true };
}
