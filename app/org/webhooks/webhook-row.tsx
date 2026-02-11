'use client';

import { useRouter } from 'next/navigation';
import { deleteWebhook, toggleWebhook } from '@/app/actions/webhooks';
import { Button } from '@/components/ui/button';

type Webhook = { id: string; url: string; events: string; enabled: boolean; createdAt: Date };

export function WebhookRow({
  webhook,
  organizationId,
}: {
  webhook: Webhook;
  organizationId: string;
}) {
  const router = useRouter();
  let events: string[] = [];
  try {
    events = JSON.parse(webhook.events) as string[];
  } catch {}

  async function remove() {
    if (!confirm('Bu webhook silinsin mi?')) return;
    await deleteWebhook(organizationId, webhook.id);
    router.refresh();
  }

  async function toggle() {
    await toggleWebhook(organizationId, webhook.id, !webhook.enabled);
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 p-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium truncate">{webhook.url}</p>
        <p className="text-xs text-muted-foreground">
          {events.join(', ')} · {webhook.enabled ? 'Active' : 'Off'} · {webhook.createdAt.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={toggle}>
          {webhook.enabled ? 'Disable' : 'Enable'}
        </Button>
        <Button variant="ghost" size="sm" onClick={remove}>
          Delete
        </Button>
      </div>
    </li>
  );
}
