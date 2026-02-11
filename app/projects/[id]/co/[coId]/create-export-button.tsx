'use client';

import { useState } from 'react';
import { createExport } from '@/app/actions/export';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';

export function CreateExportButton({
  projectId,
  changeOrderId,
}: {
  projectId: string;
  changeOrderId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ pdfUrl?: string; zipUrl?: string } | null>(null);
  const { toast } = useToast();

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const r = await createExport(projectId, changeOrderId);
      if ((r as { error?: string }).error) {
        toast((r as { error: string }).error, { variant: 'error' });
      } else {
        toast('Export ready. Download links below.', { variant: 'success' });
        setResult({
          pdfUrl: (r as { pdfUrl: string }).pdfUrl,
          zipUrl: (r as { zipUrl: string }).zipUrl,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={run} disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? 'Preparing…' : 'Export PDF + ZIP'}
      </Button>
      {result && (
        <div className="flex gap-2 text-sm">
          {result.pdfUrl && (
            <a href={result.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Download PDF
            </a>
          )}
          {result.zipUrl && (
            <a href={result.zipUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Download ZIP
            </a>
          )}
        </div>
      )}
    </div>
  );
}
