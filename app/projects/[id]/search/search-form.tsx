'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

export function SearchForm({ projectId, initialQuery }: { projectId: string; initialQuery?: string }) {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery || '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    router.push(`/projects/${projectId}/search?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('project.searchPlaceholder')}
        className="max-w-md"
      />
      <Button type="submit">{t('project.searchButton')}</Button>
    </form>
  );
}
