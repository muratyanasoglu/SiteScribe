'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTemplate } from '@/app/actions/templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/toast-provider';
import { useT } from '@/components/locale-provider';

export function TemplateCreateForm({
  organizationId,
  projectId,
}: {
  organizationId: string;
  projectId: string;
}) {
  const router = useRouter();
  const t = useT();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createTemplate(organizationId, formData);
    setLoading(false);
    form.reset();
    toast(t('project.templateCreated'), { variant: 'success' });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-w-xl">
      <div>
        <Label htmlFor="t-name">{t('project.templateNameLabel')}</Label>
        <Input id="t-name" name="name" required placeholder={t('project.templateNamePlaceholder')} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="t-scope">{t('project.templateScopeOptional')}</Label>
        <Textarea
          id="t-scope"
          name="scopeBody"
          placeholder={t('project.templateScopePlaceholder')}
          rows={3}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="t-lineitems">{t('project.templateLineItemsOptional')}</Label>
        <Textarea
          id="t-lineitems"
          name="lineItemsJson"
          placeholder={t('project.templateLineItemsPlaceholder')}
          rows={2}
          className="mt-1 font-mono text-sm"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <LoadingSpinner />}
        {loading ? t('co.saving') : t('project.createTemplate')}
      </Button>
    </form>
  );
}
