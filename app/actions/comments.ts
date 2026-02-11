'use server';

import { prisma } from '@/lib/db';
import { requireProjectAccess } from '@/lib/auth-server';
import { canComment } from '@/lib/rbac';
import { createNotification } from '@/lib/notifications';
import { validateCommentBody } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function addComment(
  projectId: string,
  body: string,
  options: { changeEventId?: string; changeOrderId?: string }
) {
  const { userId, role, project } = await requireProjectAccess(projectId, 'FIELD');
  if (!canComment(role)) return { error: 'Forbidden' };
  const bodyResult = validateCommentBody(body);
  if (!bodyResult.ok) return { error: bodyResult.error };
  if (!options.changeEventId && !options.changeOrderId) return { error: 'Need event or CO' };
  await prisma.comment.create({
    data: {
      userId,
      body: bodyResult.body,
      changeEventId: options.changeEventId ?? undefined,
      changeOrderId: options.changeOrderId ?? undefined,
    },
  });
  if (options.changeOrderId) {
    const co = await prisma.changeOrder.findFirst({
      where: { id: options.changeOrderId, projectId },
      select: { title: true },
    });
    const members = await prisma.membership.findMany({
      where: { organizationId: project.organizationId, role: { in: ['PM', 'OWNER'] } },
      select: { userId: true },
    });
    const link = `/projects/${projectId}/co/${options.changeOrderId}`;
    for (const m of members) {
      if (m.userId === userId) continue;
      await createNotification({
        userId: m.userId,
        type: 'COMMENT',
        title: 'CO\'da yeni yorum',
        body: co ? `${co.title}: ${bodyResult.body.slice(0, 80)}${bodyResult.body.length > 80 ? '…' : ''}` : bodyResult.body.slice(0, 100),
        link,
      });
    }
    revalidatePath(`/projects/${projectId}/co/${options.changeOrderId}`);
  }
  if (options.changeEventId) revalidatePath(`/projects/${projectId}/events/${options.changeEventId}`);
  return { ok: true };
}
