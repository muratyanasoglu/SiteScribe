/**
 * Webhook delivery: POST to registered URLs when a CO is created or its status changes (co.created, co.status_changed).
 */

import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function triggerWebhooks(organizationId: string, event: string, payload: object) {
  const webhooks = await prisma.webhook.findMany({
    where: { organizationId, enabled: true },
  });
  const eventList = event; // e.g. "co.created"
  for (const wh of webhooks) {
    let events: string[] = [];
    try {
      events = typeof wh.events === 'string' ? JSON.parse(wh.events) : [];
    } catch {
      continue;
    }
    if (!events.includes(event)) continue;
    const body = JSON.stringify({ event, ...payload });
    const signature = wh.secret
      ? crypto.createHmac('sha256', wh.secret).update(body).digest('hex')
      : undefined;
    try {
      await fetch(wh.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(signature && { 'X-SiteScribe-Signature': signature }),
        },
        body,
      });
    } catch (err) {
      console.error('[Webhook]', wh.url, err);
    }
  }
}
