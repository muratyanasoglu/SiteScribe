'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createWebhook } from '@/app/actions/webhooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';

export function WebhookForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [coCreated, setCoCreated] = useState(true);
  const [coStatusChanged, setCoStatusChanged] = useState(true);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    const events: string[] = [];
    if (coCreated) events.push('co.created');
    if (coStatusChanged) events.push('co.status_changed');
    if (events.length === 0) {
      toast(t('org.selectAtLeastOneEvent'), { variant: 'info' });
      setLoading(false);
      return;
    }
    const result = await createWebhook(organizationId, url.trim(), events, secret.trim() || undefined);
    setLoading(false);
    if ((result as { error?: string }).error) {
      toast((result as { error: string }).error, { variant: 'error' });
    } else {
      toast(t('org.webhookAdded'), { variant: 'success' });
      setUrl('');
      setSecret('');
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="wh-url">URL</Label>
        <Input
          id="wh-url"
          type="url"
          placeholder="https://example.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="wh-secret">Secret (optional, for signing)</Label>
        <Input
          id="wh-secret"
          type="password"
          placeholder="••••••••"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={coCreated}
            onChange={(e) => setCoCreated(e.target.checked)}
          />
          co.created
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={coStatusChanged}
            onChange={(e) => setCoStatusChanged(e.target.checked)}
          />
          co.status_changed
        </label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? t('common.adding') : t('org.addWebhook')}
      </Button>
    </form>
  );
}
