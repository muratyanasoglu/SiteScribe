'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { requireOrgRole } from '@/lib/auth-server';
import { validateEmail, isValidId } from '@/lib/validation';
import { sendInviteEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

const INVITE_EXPIRY_DAYS = 7;
const ALLOWED_ROLES = ['VIEWER', 'SUBCONTRACTOR', 'FIELD', 'PM'] as const;

export async function inviteMember(organizationId: string, email: string, role: string) {
  await requireOrgRole(organizationId, 'OWNER');
  const emailResult = validateEmail(email);
  if (!emailResult.ok) return { error: emailResult.error };
  const roleTrimmed = typeof role === 'string' ? role.trim().toUpperCase() : '';
  if (!ALLOWED_ROLES.includes(roleTrimmed as typeof ALLOWED_ROLES[number])) {
    return { error: 'Invalid role' };
  }
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);
  await prisma.invitation.create({
    data: {
      organizationId,
      email: emailResult.email,
      role: roleTrimmed as 'VIEWER' | 'SUBCONTRACTOR' | 'FIELD' | 'PM',
      token,
      expiresAt,
    },
  });
  const org = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;
  const user = await (await import('@/lib/auth-server')).getCurrentUser();
  const result = await sendInviteEmail({
    to: emailResult.email,
    inviterName: user?.name || 'A user',
    orgName: org.name,
    role,
    acceptUrl,
    expiresInDays: INVITE_EXPIRY_DAYS,
  });
  revalidatePath('/org');
  if (!result.ok) return { error: result.error };
  return { ok: true };
}

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

/** Invite a friend (by userId) to the organization. Uses their email; same flow as inviteMember. */
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
  return inviteMember(organizationId, friend.email, role);
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
