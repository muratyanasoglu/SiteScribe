'use client';

import { useState } from 'react';
import { register } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import { SECURITY_QUESTION_KEYS } from '@/lib/validation';
import { cn } from '@/lib/utils';

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
      <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2">
        <p className="text-sm font-medium text-foreground">{t('auth.securityQuestionTitle')}</p>
        <p className="text-xs text-muted-foreground">{t('auth.securityQuestionHint')}</p>
        <div>
          <Label htmlFor="securityQuestionKey" className="sr-only">{t('auth.securityQuestionLabel')}</Label>
          <select
            id="securityQuestionKey"
            name="securityQuestionKey"
            required
            className={cn(
              'flex h-11 w-full rounded-lg border-2 border-input bg-background px-3.5 py-2.5 text-sm',
              'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary/30'
            )}
          >
            <option value="">{t('auth.securityQuestionChoose')}</option>
            {SECURITY_QUESTION_KEYS.map((key) => (
              <option key={key} value={key}>{t(`auth.securityQuestion_${key}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="securityAnswer">{t('auth.securityAnswer')}</Label>
          <Input
            id="securityAnswer"
            name="securityAnswer"
            type="text"
            required
            autoComplete="off"
            className="mt-1"
            placeholder={t('auth.securityAnswerPlaceholder')}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {t('auth.register')}
      </Button>
    </form>
  );
}
