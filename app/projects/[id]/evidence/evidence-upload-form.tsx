'use client';

import { useState } from 'react';
import { uploadEvidence } from '@/app/actions/evidence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/components/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EVIDENCE_TYPE_KEYS: { value: string; labelKey: string }[] = [
  { value: 'SITE_LOG', labelKey: 'evidenceForm.siteLog' },
  { value: 'PHOTO', labelKey: 'evidenceForm.photo' },
  { value: 'RFI_DOC', labelKey: 'evidenceForm.rfiPdf' },
  { value: 'PLAN_REVISION', labelKey: 'evidenceForm.planRevisionPdf' },
  { value: 'CONTRACT', labelKey: 'evidenceForm.contractPdf' },
];

export function EvidenceUploadForm({ projectId }: { projectId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('SITE_LOG');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const formData = new FormData();
    formData.set('type', type);
    formData.set('title', (form.elements.namedItem('title') as HTMLInputElement)?.value || '');
    formData.set('description', (form.elements.namedItem('description') as HTMLTextAreaElement)?.value || '');
    formData.set('occurredAt', (form.elements.namedItem('occurredAt') as HTMLInputElement)?.value || new Date().toISOString().slice(0, 16));
    const file = (form.elements.namedItem('file') as HTMLInputElement)?.files?.[0];
    if (file) formData.set('file', file);
    const textContent = (form.elements.namedItem('textContent') as HTMLTextAreaElement)?.value;
    if (textContent) formData.set('textContent', textContent);
    const result = await uploadEvidence(projectId, formData);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>{t('project.uploadEvidence')}</Button>;
  }
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border/80 bg-card p-5 space-y-4 max-w-md shadow-soft">
      <h3 className="font-semibold">{t('evidenceForm.addEvidence')}</h3>
      <div>
        <Label>{t('evidenceForm.type')}</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVIDENCE_TYPE_KEYS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="title">{t('evidenceForm.titleOptional')}</Label>
        <Input id="title" name="title" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="occurredAt">{t('evidenceForm.occurredAt')}</Label>
        <Input id="occurredAt" name="occurredAt" type="datetime-local" className="mt-1" />
      </div>
      {type === 'SITE_LOG' && (
        <div>
          <Label htmlFor="textContent">{t('evidenceForm.contentText')}</Label>
          <Textarea id="textContent" name="textContent" rows={4} className="mt-1" />
        </div>
      )}
      {type !== 'SITE_LOG' && (
        <div>
          <Label htmlFor="file">{t('evidenceForm.file')}</Label>
          <Input id="file" name="file" type="file" accept={type === 'PHOTO' ? 'image/*' : 'application/pdf'} className="mt-1" />
        </div>
      )}
      <div>
        <Label htmlFor="description">{t('evidenceForm.descriptionOptional')}</Label>
        <Textarea id="description" name="description" rows={2} className="mt-1" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">{t('evidenceForm.upload')}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
