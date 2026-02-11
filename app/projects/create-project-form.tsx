'use client';

import { useState } from 'react';
import { createProject } from '@/app/actions/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/components/locale-provider';

export function CreateProjectForm({ organizationId }: { organizationId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createProject(organizationId, formData);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    const id = (result as { projectId: string }).projectId;
    setOpen(false);
    window.location.href = `/projects/${id}`;
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>{t('project.newProject')}</Button>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-border/80 p-3">
      <div>
        <Label htmlFor="proj-name">{t('project.name')}</Label>
        <Input id="proj-name" name="name" required className="mt-1 w-full min-w-0 sm:w-48 max-w-xs" />
      </div>
      <div>
        <Label htmlFor="proj-desc">{t('project.description')}</Label>
        <Textarea id="proj-desc" name="description" className="mt-1 w-full min-w-0 sm:w-64 max-w-md" rows={1} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">{t('project.create')}</Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
    </form>
  );
}
