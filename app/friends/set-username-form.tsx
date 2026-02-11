'use client';

import { useState } from 'react';
import { updateUsername } from '@/app/actions/friends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import { useRouter } from 'next/navigation';

export function SetUsernameForm() {
  const t = useT();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const q = username.trim();
    if (!q) return;
    setLoading(true);
    const result = await updateUsername(q);
    setLoading(false);
    if ((result as { error?: string }).error) {
      setError((result as { error: string }).error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <Label htmlFor="set-username" className="text-sm">{t('friends.username')}</Label>
        <Input
          id="set-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('friends.usernamePlaceholder')}
          className="mt-1 w-full min-w-[140px] max-w-[200px]"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? t('common.loading') : t('friends.saveUsername')}
      </Button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </form>
  );
}
