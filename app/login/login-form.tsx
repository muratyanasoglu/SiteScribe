'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';

export function LoginForm() {
  const t = useT();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const registered = searchParams.get('registered');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) setError(t('auth.invalidCredentials'));
    if (res?.ok) window.location.href = '/org';
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered && (
        <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">
          {t('auth.registeredPleaseSignIn')}
        </p>
      )}
      {error && (
        <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
      )}
      <div>
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input id="email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" name="password" type="password" required className="mt-1" />
      </div>
      <Button type="submit" className="w-full">
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
