'use server';

import { prisma } from '@/lib/db';
import { getCurrentUser, requireOrgRole } from '@/lib/auth-server';
import { getStorageProvider } from '@/lib/storage';
import {
  validateChatMessageBody,
  isValidId,
  sanitizeString,
  LIMITS,
  ALLOWED_CHAT_ATTACHMENT_MIMES,
  CHAT_ATTACHMENT_SIZE_MAX,
} from '@/lib/validation';
import { createNotification } from '@/lib/notifications';
import { revalidatePath } from 'next/cache';

export type OrgChatRoomItem = {
  orgId: string;
  orgName: string;
  roomId: string;
  lastMessage: { body: string; createdAt: Date; senderName: string | null } | null;
};

/** List org chat rooms for organizations the current user is a member of. */
export async function getOrgChatRooms(): Promise<OrgChatRoomItem[]> {
  const me = await getCurrentUser();
  if (!me) return [];

  const memberships = await prisma.membership.findMany({
    where: { userId: me.id },
    include: {
      organization: {
        include: {
          orgChatRoom: {
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { sender: { select: { name: true, username: true } } },
              },
            },
          },
        },
      },
    },
  });

  return memberships
    .filter((m) => m.organization.orgChatRoom)
    .map((m) => {
      const room = m.organization.orgChatRoom!;
      const last = room.messages[0];
      return {
        orgId: m.organization.id,
        orgName: m.organization.name,
        roomId: room.id,
        lastMessage: last
          ? {
              body: last.body,
              createdAt: last.createdAt,
              senderName: last.sender.name || last.sender.username || null,
            }
          : null,
      };
    })
    .sort((a, b) => {
      const tA = a.lastMessage?.createdAt?.getTime() ?? 0;
      const tB = b.lastMessage?.createdAt?.getTime() ?? 0;
      return tB - tA;
    });
}

export type OrgChatMessageItem = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: { id: string; username: string | null; name: string | null };
  attachmentUrl: string | null;
  attachmentMimeType: string | null;
  attachmentFileName: string | null;
};

/** Get messages for an org's group chat. Only org members can read. */
export async function getOrgChatMessages(
  organizationId: string
): Promise<{ error?: string; messages?: OrgChatMessageItem[] }> {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(organizationId)) return { error: 'Invalid organization' };

  await requireOrgRole(organizationId, 'VIEWER');

  const room = await prisma.orgChatRoom.findUnique({
    where: { organizationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, username: true, name: true } },
        },
      },
    },
  });

  if (!room) return { error: 'Chat room not found' };

  const messages: OrgChatMessageItem[] = room.messages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt,
    senderId: m.senderId,
    sender: m.sender,
    attachmentUrl: m.attachmentUrl,
    attachmentMimeType: m.attachmentMimeType,
    attachmentFileName: m.attachmentFileName,
  }));

  return { messages };
}

/** Send a message (and optional file) to the org group chat. Only org members. */
export async function sendOrgChatMessage(
  organizationId: string,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const me = await getCurrentUser();
  if (!me) return { error: 'Unauthorized' };
  if (!isValidId(organizationId)) return { error: 'Invalid organization' };

  await requireOrgRole(organizationId, 'VIEWER');

  const bodyRaw = formData.get('body') as string | null;
  const file = formData.get('file') as File | null;
  const hasFile = file && file.size > 0;
  const bodyResult = hasFile
    ? { ok: true as const, body: sanitizeString(bodyRaw ?? '', LIMITS.chatMessageBody) || ' ' }
    : validateChatMessageBody(bodyRaw ?? '');
  if (!bodyResult.ok) return { error: bodyResult.error };

  const room = await prisma.orgChatRoom.findUnique({
    where: { organizationId },
    include: { organization: { select: { name: true } } },
  });
  if (!room) return { error: 'Chat room not found' };

  let attachmentUrl: string | null = null;
  let attachmentMimeType: string | null = null;
  let attachmentFileName: string | null = null;

  if (hasFile && file) {
    if (file.size > CHAT_ATTACHMENT_SIZE_MAX) {
      return { error: 'File too large' };
    }
    const mime = (file.type || 'application/octet-stream').toLowerCase();
    const allowed = [...ALLOWED_CHAT_ATTACHMENT_MIMES];
    if (!allowed.includes(mime as (typeof allowed)[number])) {
      return { error: 'File type not allowed' };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageProvider();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 200);
    const key = `chat/org/${organizationId}/${Date.now()}-${safeName}`;
    const result = await storage.upload(buffer, key, {
      mimeType: mime,
      projectId: organizationId,
      evidenceId: '',
    });
    attachmentUrl = result.url;
    attachmentMimeType = mime;
    attachmentFileName = file.name.slice(0, 255);
  }

  await prisma.orgChatMessage.create({
    data: {
      roomId: room.id,
      senderId: me.id,
      body: bodyResult.body,
      attachmentUrl,
      attachmentMimeType,
      attachmentFileName,
    },
  });

  const members = await prisma.membership.findMany({
    where: { organizationId, userId: { not: me.id } },
    select: { userId: true },
  });
  const senderLabel = me.name || me.username || me.email;
  const preview =
    bodyResult.body.length > 80 ? bodyResult.body.slice(0, 80) + '…' : bodyResult.body;
  for (const { userId } of members) {
    await createNotification({
      userId,
      type: 'ORG_CHAT_MESSAGE',
      title: `${room.organization.name}: ${senderLabel}`,
      body: preview,
      link: `/org/chat?org=${organizationId}`,
    });
  }

  revalidatePath('/org/chat');
  revalidatePath(`/org/chat?org=${organizationId}`);
  return { ok: true };
}
