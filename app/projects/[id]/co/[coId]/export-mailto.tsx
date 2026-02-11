'use client';

import { useState } from 'react';
import { createExport } from '@/app/actions/export';
import { recordSentAndGetMailto } from '@/app/actions/export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';

export function ExportAndMailto({
  projectId,
  changeOrderId,
}: {
  projectId: string;
  changeOrderId: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleExportAndMailto() {
    if (!email.trim()) {
      toast('Enter recipient email address.', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const exportResult = await createExport(projectId, changeOrderId);
      if ((exportResult as { error?: string }).error) {
        toast((exportResult as { error: string }).error, { variant: 'error' });
        return;
      }
      const jobId = (exportResult as { exportId: string }).exportId;
      const { mailto } = await recordSentAndGetMailto(projectId, changeOrderId, jobId, email.trim());
      toast('Your email client is opening.', { variant: 'success' });
      window.location.href = mailto;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-end gap-2">
      <div>
        <Label htmlFor="mailto-email" className="text-xs">Send to (mailto)</Label>
        <Input
          id="mailto-email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-48"
        />
      </div>
      <Button variant="outline" onClick={handleExportAndMailto} disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? 'Preparing…' : 'Export + mailto'}
      </Button>
    </div>
  );
}
