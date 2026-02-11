'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrichChangeOrderWithAi } from '@/app/actions/ai';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';

export function EnrichWithAiButton({
  projectId,
  coId,
  hasEvent,
}: {
  projectId: string;
  coId: string;
  hasEvent: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleEnrich() {
    if (!hasEvent) {
      toast('Bu CO’ya bağlı event yok; AI zenginleştirme yapılamaz.', { variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      const result = await enrichChangeOrderWithAi(projectId, coId, 'en');
      if ((result as { error?: string }).error) {
        toast((result as { error: string }).error, { variant: 'error' });
      } else {
        toast('CO updated with AI.', { variant: 'success' });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleEnrich} disabled={loading}>
      {loading && <LoadingSpinner />}
      {loading ? 'Enriching…' : 'Enrich with AI'}
    </Button>
  );
}
