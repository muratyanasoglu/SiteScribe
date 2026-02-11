'use server';

import { prisma } from '@/lib/db';
import { requireOrgRole } from '@/lib/auth-server';
import { validateUrl, isValidId, LIMITS } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

const ALLOWED_EVENTS = ['co.created', 'co.status_changed'] as const;

export async function listWebhooks(organizationId: string) {
  await requireOrgRole(organizationId, 'OWNER');
  return prisma.webhook.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createWebhook(
  organizationId: string,
  url: string,
  events: string[],
  secret?: string
) {
  await requireOrgRole(organizationId, 'OWNER');
  const urlResult = validateUrl(url);
  if (!urlResult.ok) return { error: urlResult.error };
  const filtered = events.filter((e) => ALLOWED_EVENTS.includes(e as typeof ALLOWED_EVENTS[number]));
  if (filtered.length === 0) return { error: 'Select at least one event' };
  const secretTrimmed = typeof secret === 'string' ? secret.trim().slice(0, LIMITS.webhookSecret) || null : null;
  await prisma.webhook.create({
    data: {
      organizationId,
      url: urlResult.url,
      events: JSON.stringify(filtered),
      secret: secretTrimmed,
      enabled: true,
    },
  });
  revalidatePath('/org');
  revalidatePath('/org/webhooks');
  return { ok: true };
}

export async function deleteWebhook(organizationId: string, webhookId: string) {
  await requireOrgRole(organizationId, 'OWNER');
  if (!isValidId(webhookId)) return { error: 'Invalid webhook' };
  await prisma.webhook.deleteMany({
    where: { id: webhookId, organizationId },
  });
  revalidatePath('/org');
  revalidatePath('/org/webhooks');
  return { ok: true };
}

export async function toggleWebhook(organizationId: string, webhookId: string, enabled: boolean) {
  await requireOrgRole(organizationId, 'OWNER');
  if (!isValidId(webhookId)) return { error: 'Invalid webhook' };
  await prisma.webhook.updateMany({
    where: { id: webhookId, organizationId },
    data: { enabled },
  });
  revalidatePath('/org');
  revalidatePath('/org/webhooks');
  return { ok: true };
}
