'use client';

import { useState } from 'react';
import { createOrganization } from '@/app/actions/org';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';

export function CreateOrgForm() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createOrganization(formData);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>{t('org.createOrganization')}</Button>;
  }
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-2 rounded-lg border border-border/80 p-3">
      <div>
        <Label htmlFor="org-name">Name</Label>
        <Input id="org-name" name="name" required className="mt-1 w-full min-w-0 sm:w-48 max-w-xs" />
      </div>
      <div>
        <Label htmlFor="org-slug">Slug (optional)</Label>
        <Input id="org-slug" name="slug" placeholder="my-org" className="mt-1 w-full min-w-0 sm:w-32 max-w-[8rem]" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit">Create</Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </form>
  );
}
