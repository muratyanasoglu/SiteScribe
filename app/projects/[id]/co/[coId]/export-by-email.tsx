'use client';

import { useState } from 'react';
import { sendExportByEmail } from '@/app/actions/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';

/** Sends the export package as an email attachment via Resend. Requires RESEND_API_KEY. */
export function ExportByEmail({
  projectId,
  changeOrderId,
}: {
  projectId: string;
  changeOrderId: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    if (!email.trim()) {
      toast('Enter recipient email address.', { variant: 'info' });
      return;
    }
    setLoading(true);
    const result = await sendExportByEmail(projectId, changeOrderId, email.trim());
    setLoading(false);
    if ((result as { error?: string }).error) {
      toast((result as { error: string }).error, { variant: 'error' });
    } else {
      toast('Export sent by email.', { variant: 'success' });
      setEmail('');
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto">
      <div className="w-full sm:w-52 min-w-0">
        <Label htmlFor="resend-email" className="text-xs">Send by email (Resend)</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="alici@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full"
        />
      </div>
      <Button
        variant="secondary"
        onClick={handleSend}
        disabled={loading}
      >
        {loading && <LoadingSpinner />}
        {loading ? 'Sending…' : 'Send by email'}
      </Button>
    </div>
  );
}
