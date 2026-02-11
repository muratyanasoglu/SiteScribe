'use client';

import { useState } from 'react';
import { createChangeOrderDraft } from '@/app/actions/change-order';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function GenerateCODraftForm({
  projectId,
  eventId,
  templates,
}: {
  projectId: string;
  eventId: string;
  templates: { id: string; name: string }[];
}) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');
  const { toast } = useToast();

  async function submit() {
    setLoading(true);
    try {
      const result = await createChangeOrderDraft(projectId, eventId, {
        templateId: templateId || undefined,
      });
      if ((result as { error?: string }).error) {
        toast((result as { error: string }).error, { variant: 'error' });
      } else {
        const r = result as { changeOrderId: string; llmUsed?: boolean };
        const url = `/projects/${projectId}/co/${r.changeOrderId}` + (r.llmUsed ? '?llm=1' : '');
        window.location.href = url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      {templates.length > 0 && (
        <div>
          <Label className="text-xs">Template (optional)</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger className="w-48 mt-1">
              <SelectValue placeholder={t('project.selectTemplate')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Yok</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button onClick={submit} disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? 'Creating…' : 'Create CO draft'}
      </Button>
    </div>
  );
}
