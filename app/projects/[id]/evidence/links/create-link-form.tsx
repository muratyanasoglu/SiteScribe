'use client';

import { useState } from 'react';
import { createEvidenceLink } from '@/app/actions/evidence-links';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type EvidenceItem = { id: string; title: string | null; type: string };

export function CreateLinkForm({
  projectId,
  evidenceList,
}: {
  projectId: string;
  evidenceList: EvidenceItem[];
}) {
  const t = useT();
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [linkType, setLinkType] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromId || !toId || fromId === toId) return;
    setLoading(true);
    await createEvidenceLink(projectId, fromId, toId, linkType || undefined);
    setFromId('');
    setToId('');
    setLinkType('');
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-lg border border-border/80 p-3">
      <div>
        <Label className="text-xs">{t('project.source')}</Label>
        <Select value={fromId} onValueChange={setFromId}>
          <SelectTrigger className="w-full min-w-0 sm:w-48 max-w-[12rem] mt-1">
            <SelectValue placeholder={t('common.select')} />
          </SelectTrigger>
          <SelectContent>
            {evidenceList.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title || e.type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">{t('project.target')}</Label>
        <Select value={toId} onValueChange={setToId}>
          <SelectTrigger className="w-full min-w-0 sm:w-48 max-w-[12rem] mt-1">
            <SelectValue placeholder={t('common.select')} />
          </SelectTrigger>
          <SelectContent>
            {evidenceList.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title || e.type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">{t('project.typeOptional')}</Label>
        <Input
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
          placeholder={t('project.linkTypePlaceholder')}
          className="w-full min-w-0 sm:w-24 max-w-[6rem] mt-1"
        />
      </div>
      <Button type="submit" disabled={loading || !fromId || !toId || fromId === toId}>
        {t('project.addLink')}
      </Button>
    </form>
  );
}
