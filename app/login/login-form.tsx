'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
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
  const [failedIdentifier, setFailedIdentifier] = useState('');
  const registered = searchParams.get('registered');
  const passwordReset = searchParams.get('passwordReset');
  const emailChanged = searchParams.get('emailChanged');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const emailOrUsername = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await signIn('credentials', { email: emailOrUsername, password, redirect: false });
    if (res?.error) {
      setError(t('auth.invalidCredentials'));
      setFailedIdentifier(emailOrUsername);
    }
    if (res?.ok) window.location.href = '/org';
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(registered || passwordReset || emailChanged) && (
        <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">
          {emailChanged ? t('auth.emailChangedSignIn') : passwordReset ? t('auth.passwordResetSuccess') : t('auth.registeredPleaseSignIn')}
        </p>
      )}
      {error && (
        <div className="space-y-2">
          <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
          <p className="text-sm">
            <Link
              href={`/forgot-password${failedIdentifier ? `?identifier=${encodeURIComponent(failedIdentifier)}` : ''}`}
              className="text-primary hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </p>
        </div>
      )}
      <div>
        <Label htmlFor="email">{t('auth.emailOrUsername')}</Label>
        <Input id="email" name="email" type="text" autoComplete="username" required className="mt-1" placeholder={t('auth.emailOrUsernamePlaceholder')} />
      </div>
      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="mt-1" />
      </div>
      <Button type="submit" className="w-full">
        {t('auth.signIn')}
      </Button>
    </form>
  );
}
