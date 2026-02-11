'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import { validateUsername, isValidId } from '@/lib/validation';
import { createNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export type UserSearchResult = {
  id: string;
  username: string | null;
  name: string | null;
  email: string;
  status: FriendStatus;
};

/** Search users by username. Returns public profile + friend status for each. Excludes current user. */
export async function searchUsersByUsername(query: string): Promise<
  { error: string; users: UserSearchResult[] } | { users: UserSearchResult[] }
> {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized', users: [] };
  const q = typeof query === 'string' ? query.trim().toLowerCase().slice(0, 100) : '';
  if (q.length < 2) return { users: [] };
  const users = await prisma.user.findMany({
    where: {
      id: { not: me.id },
      username: { not: null, contains: q },
    },
    select: { id: true, username: true, name: true, email: true },
    take: 20,
  });
  const filtered = users.filter((u) => u.username?.toLowerCase().includes(q));
  if (filtered.length === 0) return { users: [] };
  const userIds = filtered.map((u) => u.id);
  const requests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: { in: userIds } },
        { toUserId: me.id, fromUserId: { in: userIds } },
      ],
    },
  });
  const statusByUserId: Record<string, FriendStatus> = {};
  for (const r of requests) {
    const other = r.fromUserId === me.id ? r.toUserId : r.fromUserId;
    if (r.status === 'ACCEPTED') statusByUserId[other] = 'friends';
    else if (r.fromUserId === me.id) statusByUserId[other] = 'pending_sent';
    else statusByUserId[other] = 'pending_received';
  }
  const results: UserSearchResult[] = filtered.map((u) => ({
    ...u,
    status: (statusByUserId[u.id] ?? 'none') as FriendStatus,
  }));
  return { users: results };
}

/** Get a single user's public profile by exact username (for "view profile" after search). */
export async function getUserByUsername(username: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized', user: null };
  const result = validateUsername(username);
  if (!result.ok) return { error: result.error, user: null };
  const user = await prisma.user.findUnique({
    where: { username: result.username },
    select: { id: true, username: true, name: true },
  });
  if (!user) return { user: null };
  if (user.id === me.id) return { error: 'Cannot add yourself', user: null };
  return { user };
}

/** Send a friend request. */
export async function sendFriendRequest(toUserId: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(toUserId)) return { error: 'Invalid user' };
  if (toUserId === me.id) return { error: 'Cannot send request to yourself' };
  const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!toUser) return { error: 'User not found' };
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromUserId: me.id, toUserId },
        { fromUserId: toUserId, toUserId: me.id },
      ],
    },
  });
  if (existing) {
    if (existing.status === 'ACCEPTED') return { error: 'Already friends' };
    if (existing.fromUserId === me.id) return { error: 'Request already sent' };
    return { error: 'They already sent you a request. Check incoming requests.' };
  }
  await prisma.friendRequest.create({
    data: { fromUserId: me.id, toUserId, status: 'PENDING' },
  });
  const senderLabel = me.name || me.username || me.email;
  await createNotification({
    userId: toUserId,
    type: 'FRIEND_REQUEST',
    title: `Friend request from ${senderLabel}`,
    body: `${senderLabel} wants to add you as a friend.`,
    link: '/friends',
  });
  revalidatePath('/friends');
  return { ok: true };
}

/** Accept a friend request (only the recipient can accept). */
export async function acceptFriendRequest(requestId: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(requestId)) return { error: 'Request not found' };
  const req = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });
  if (!req || req.toUserId !== me.id) return { error: 'Request not found' };
  if (req.status !== 'PENDING') return { error: 'Request already handled' };
  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'ACCEPTED' },
  });
  const accepterLabel = me.name || me.username || me.email;
  await createNotification({
    userId: req.fromUserId,
    type: 'FRIEND_ACCEPTED',
    title: `${accepterLabel} accepted your friend request`,
    body: `You are now friends with ${accepterLabel}.`,
    link: '/friends',
  });
  revalidatePath('/friends');
  return { ok: true };
}

/** Decline a friend request. */
export async function declineFriendRequest(requestId: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(requestId)) return { error: 'Request not found' };
  const req = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });
  if (!req || req.toUserId !== me.id) return { error: 'Request not found' };
  if (req.status !== 'PENDING') return { error: 'Request already handled' };
  await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: 'DECLINED' },
  });
  revalidatePath('/friends');
  return { ok: true };
}

/** List incoming PENDING friend requests (for current user). */
export async function listIncomingFriendRequests() {
  const me = await getCurrentUser();
  if (!me) return [];
  const list = await prisma.friendRequest.findMany({
    where: { toUserId: me.id, status: 'PENDING' },
    include: { fromUser: { select: { id: true, username: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return list;
}

/** List outgoing PENDING friend requests (sent by current user). */
export async function listOutgoingFriendRequests() {
  const me = await getCurrentUser();
  if (!me) return [];
  const list = await prisma.friendRequest.findMany({
    where: { fromUserId: me.id, status: 'PENDING' },
    include: { toUser: { select: { id: true, username: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return list;
}

/** List friends (ACCEPTED requests in either direction). Returns other user's id, username, name. */
export async function listFriends() {
  const me = await getCurrentUser();
  if (!me) return [];
  const accepted = await prisma.friendRequest.findMany({
    where: { status: 'ACCEPTED' },
    include: {
      fromUser: { select: { id: true, username: true, name: true } },
      toUser: { select: { id: true, username: true, name: true } },
    },
  });
  const friends = accepted
    .filter((r) => r.fromUserId === me.id || r.toUserId === me.id)
    .map((r) => (r.fromUserId === me.id ? r.toUser : r.fromUser));
  return friends;
}

/** Get friendship status with a user: 'none' | 'pending_sent' | 'pending_received' | 'friends'. */
export async function getFriendStatus(otherUserId: string) {
  const me = await getCurrentUser();
  if (!me || !isValidId(otherUserId) || me.id === otherUserId) return 'none';
  const req = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromUserId: me.id, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: me.id },
      ],
    },
  });
  if (!req) return 'none';
  if (req.status === 'ACCEPTED') return 'friends';
  if (req.fromUserId === me.id) return 'pending_sent';
  return 'pending_received';
}

/** Update current user's username (so others can find them). */
export async function updateUsername(newUsername: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  const result = validateUsername(newUsername);
  if (!result.ok) return { error: result.error };
  const taken = await prisma.user.findUnique({
    where: { username: result.username },
  });
  if (taken && taken.id !== me.id) return { error: 'This username is already taken' };
  await prisma.user.update({
    where: { id: me.id },
    data: { username: result.username },
  });
  revalidatePath('/friends');
  revalidatePath('/org');
  return { ok: true };
}

/** List friends who are not members of the given organization (for org invite dropdown). Returns id, username, name, email. */
export async function listFriendsNotInOrg(organizationId: string) {
  const me = await getCurrentUser();
  if (!me || !isValidId(organizationId)) return [];
  const friends = await listFriends();
  if (friends.length === 0) return [];
  const friendIds = friends.map((f) => f.id);
  const members = await prisma.membership.findMany({
    where: { organizationId, userId: { in: friendIds } },
    select: { userId: true },
  });
  const memberIds = new Set(members.map((m) => m.userId));
  const notMembers = friendIds.filter((id) => !memberIds.has(id));
  if (notMembers.length === 0) return [];
  const users = await prisma.user.findMany({
    where: { id: { in: notMembers } },
    select: { id: true, username: true, name: true, email: true },
  });
  return users;
}
