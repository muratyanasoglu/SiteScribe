'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type PlanRevision = { id: string; title: string; occurredAt: Date };

export function PlanRevisionCompareForm({
  projectId,
  planRevisions,
  leftId,
  rightId,
}: {
  projectId: string;
  planRevisions: PlanRevision[];
  leftId?: string;
  rightId?: string;
}) {
  const router = useRouter();
  const t = useT();
  const [left, setLeft] = useState(leftId ?? '');
  const [right, setRight] = useState(rightId ?? '');

  function compare() {
    if (!left || !right) return;
    router.push(`/projects/${projectId}/evidence/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`);
  }

  if (planRevisions.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">
        {t('project.atLeastTwoPlanRevisions')}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-full min-w-0 sm:w-64">
        <Label className="text-xs">{t('project.leftRevision')}</Label>
        <Select value={left} onValueChange={setLeft}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder={t('common.select')} />
          </SelectTrigger>
          <SelectContent>
            {planRevisions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} – {e.occurredAt.toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full min-w-0 sm:w-64">
        <Label className="text-xs">{t('project.rightRevision')}</Label>
        <Select value={right} onValueChange={setRight}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder={t('common.select')} />
          </SelectTrigger>
          <SelectContent>
            {planRevisions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title} – {e.occurredAt.toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={compare} disabled={!left || !right || left === right}>
        {t('project.compare')}
      </Button>
    </div>
  );
}
