'use client';

import { useState } from 'react';
import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';

export function RegisterForm() {
  const t = useT();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await register(formData);
    if (result && typeof result === 'object' && 'error' in result) {
      setError((result as { error: string }).error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
      )}
      <div>
        <Label htmlFor="name">{t('project.name')} ({t('common.optional')})</Label>
        <Input id="name" name="name" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="username">{t('friends.username')} ({t('common.optional')})</Label>
        <Input id="username" name="username" className="mt-1" placeholder="johndoe" />
        <p className="text-xs text-muted-foreground mt-1">{t('friends.usernameHint')}</p>
      </div>
      <div>
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input id="email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" name="password" type="password" required className="mt-1" />
      </div>
      <Button type="submit" className="w-full">
        {t('auth.register')}
      </Button>
    </form>
  );
}
