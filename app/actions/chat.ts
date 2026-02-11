'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import { validateChatMessageBody, isValidId } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

/** Check if two users are friends (ACCEPTED). */
async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const r = await prisma.friendRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 },
      ],
    },
  });
  return !!r;
}

/** List conversations: friends with whom we have chatted, plus optionally all friends. Returns other user + last message + unread count. */
export async function getConversations(): Promise<
  { otherUser: { id: string; username: string | null; name: string | null }; lastMessage: { body: string; createdAt: Date } | null; unreadCount: number }[]
> {
  const me = await getCurrentUser();
  if (!me) return [];
  const friends = await prisma.friendRequest.findMany({
    where: { status: 'ACCEPTED' },
    include: {
      fromUser: { select: { id: true, username: true, name: true } },
      toUser: { select: { id: true, username: true, name: true } },
    },
  });
  const friendIds = new Set<string>();
  friends.forEach((r) => {
    if (r.fromUserId === me.id) friendIds.add(r.toUserId);
    else friendIds.add(r.fromUserId);
  });
  if (friendIds.size === 0) return [];

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: { in: Array.from(friendIds) } },
        { receiverId: me.id, senderId: { in: Array.from(friendIds) } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  const lastByOther: Record<string, { body: string; createdAt: Date }> = {};
  const unreadByOther: Record<string, number> = {};
  for (const m of messages) {
    const other = m.senderId === me.id ? m.receiverId : m.senderId;
    if (!lastByOther[other]) lastByOther[other] = { body: m.body, createdAt: m.createdAt };
    if (m.receiverId === me.id && !m.readAt) unreadByOther[other] = (unreadByOther[other] ?? 0) + 1;
  }

  const result: { otherUser: { id: string; username: string | null; name: string | null }; lastMessage: { body: string; createdAt: Date } | null; unreadCount: number }[] = [];
  const seen = new Set<string>();
  for (const fid of friendIds) {
    if (seen.has(fid)) continue;
    seen.add(fid);
    const friendRow = friends.find(
      (f) => (f.fromUserId === me.id && f.toUserId === fid) || (f.fromUserId === fid && f.toUserId === me.id)
    );
    const otherUser = friendRow?.fromUserId === me.id ? friendRow.toUser : friendRow?.fromUser;
    if (!otherUser) continue;
    result.push({
      otherUser: { id: otherUser.id, username: otherUser.username, name: otherUser.name },
      lastMessage: lastByOther[fid] ?? null,
      unreadCount: unreadByOther[fid] ?? 0,
    });
  }
  result.sort((a, b) => {
    const tA = a.lastMessage?.createdAt?.getTime() ?? 0;
    const tB = b.lastMessage?.createdAt?.getTime() ?? 0;
    return tB - tA;
  });
  return result;
}

/** Get messages between current user and another user (friend). Ordered by createdAt asc. */
export async function getMessagesWith(otherUserId: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized', messages: [] };
  if (!isValidId(otherUserId)) return { error: 'Invalid user', messages: [] };
  const friends = await areFriends(me.id, otherUserId);
  if (!friends) return { error: 'Not friends', messages: [] };
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: me.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: me.id },
      ],
    },
    include: {
      sender: { select: { id: true, username: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return { messages };
}

/** Send a message to a friend. */
export async function sendMessage(receiverId: string, body: string) {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(receiverId)) return { error: 'Invalid user' };
  const bodyResult = validateChatMessageBody(body);
  if (!bodyResult.ok) return { error: bodyResult.error };
  const friends = await areFriends(me.id, receiverId);
  if (!friends) return { error: 'You can only message friends' };
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return { error: 'User not found' };
  await prisma.chatMessage.create({
    data: { senderId: me.id, receiverId, body: bodyResult.body },
  });
  revalidatePath('/chat');
  return { ok: true };
}

/** Mark messages from a user as read (when opening the conversation). */
export async function markChatAsRead(otherUserId: string) {
  const me = await getCurrentUser();
  if (!me) return;
  if (!isValidId(otherUserId)) return;
  await prisma.chatMessage.updateMany({
    where: { senderId: otherUserId, receiverId: me.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath('/chat');
}
