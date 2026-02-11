'use client';

import { useState } from 'react';
import { runDetection } from '@/app/actions/signals';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';

export function RunDetectionButton({ projectId }: { projectId: string }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function run() {
    setLoading(true);
    try {
      const result = await runDetection(projectId);
      if ((result as { error?: string }).error) {
        toast((result as { error: string }).error, { variant: 'error' });
      } else {
        toast(t('project.signalScanCompleted'), { variant: 'success' });
        setTimeout(() => window.location.reload(), 600);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={run} disabled={loading}>
      {loading && <LoadingSpinner />}
      {loading ? t('project.scanning') : t('project.runDetection')}
    </Button>
  );
}
