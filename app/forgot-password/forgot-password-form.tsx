'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/components/locale-provider';
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from '@/app/actions/auth';
import type { SecurityQuestionKey } from '@/lib/validation';

type Step = 'identifier' | 'question' | 'newpassword' | 'done';

export function ForgotPasswordForm({ initialIdentifier }: { initialIdentifier: string }) {
  const t = useT();
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialIdentifier ? 'question' : 'identifier');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [questionKey, setQuestionKey] = useState<SecurityQuestionKey | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialIdentifier || step !== 'question' || questionKey) return;
    let cancelled = false;
    getSecurityQuestion(initialIdentifier).then((res) => {
      if (cancelled) return;
      if (res.error) {
        setError((res as { oauthAccount?: boolean }).oauthAccount ? 'oauth' : res.error);
      } else if (res.questionKey) setQuestionKey(res.questionKey);
    });
    return () => { cancelled = true; };
  }, [initialIdentifier, step, questionKey]);

  async function handleFetchQuestion(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const id = identifier.trim();
    if (!id) {
      setError(t('auth.enterIdentifier'));
      setLoading(false);
      return;
    }
    const res = await getSecurityQuestion(id);
    setLoading(false);
    if (res.error) {
      if ((res as { oauthAccount?: boolean }).oauthAccount) {
        setError('oauth');
      } else {
        setError(res.error);
      }
      return;
    }
    setIdentifier(id);
    setQuestionKey(res.questionKey!);
    setStep('question');
  }

  function handleContinueToNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!securityAnswer.trim()) {
      setError(t('auth.securityAnswerRequired'));
      return;
    }
    setStep('newpassword');
  }

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!newPassword.trim()) {
      setError(t('auth.passwordRequired'));
      return;
    }
    setLoading(true);
    const res = await resetPasswordWithSecurityAnswer(identifier, securityAnswer, newPassword);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setStep('done');
    setTimeout(() => router.push('/login?passwordReset=1'), 1500);
  }

  if (step === 'done') {
    return (
      <div className="space-y-4">
        <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">
          {t('auth.passwordResetSuccess')}
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </div>
    );
  }

  if (step === 'identifier') {
    return (
      <form onSubmit={handleFetchQuestion} className="space-y-4">
        {error && (
          <div className="space-y-2">
            {error === 'oauth' ? (
              <p className="rounded bg-muted/80 text-sm text-foreground">{t('auth.oauthAccountRecovery')}</p>
            ) : (
              <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
            )}
            {error === 'oauth' && (
              <p className="text-center">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t('auth.backToSignIn')}
                </Link>
              </p>
            )}
          </div>
        )}
        <div>
          <Label htmlFor="identifier">{t('auth.emailOrUsername')}</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }}
            placeholder={t('auth.emailOrUsernamePlaceholder')}
            className="mt-1"
            autoComplete="username"
          />
        </div>
        {error !== 'oauth' && (
          <>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.getQuestion')}
            </Button>
            <p className="text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                {t('auth.backToSignIn')}
              </Link>
            </p>
          </>
        )}
      </form>
    );
  }

  if (step === 'question') {
    if (!questionKey) {
      return (
        <form onSubmit={handleFetchQuestion} className="space-y-4">
          {error && (
            <div className="space-y-2">
              {error === 'oauth' ? (
                <>
                  <p className="rounded bg-muted/80 text-sm text-foreground">{t('auth.oauthAccountRecovery')}</p>
                  <p className="text-center">
                    <Link href="/login" className="text-primary font-medium hover:underline">{t('auth.backToSignIn')}</Link>
                  </p>
                </>
              ) : (
                <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
          {error !== 'oauth' && (
            <>
              <div>
                <Label htmlFor="identifier-question">{t('auth.emailOrUsername')}</Label>
                <Input
                  id="identifier-question"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  className="mt-1"
                  autoComplete="username"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.getQuestion')}
              </Button>
            </>
          )}
        </form>
      );
    }
    return (
      <form onSubmit={handleContinueToNewPassword} className="space-y-4">
        {error && (
          <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
        )}
        <p className="text-sm font-medium text-foreground">
          {t(`auth.securityQuestion_${questionKey}`)}
        </p>
        <div>
          <Label htmlFor="securityAnswer">{t('auth.securityAnswer')}</Label>
          <Input
            id="securityAnswer"
            name="securityAnswer"
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder={t('auth.securityAnswerPlaceholder')}
            className="mt-1"
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {t('auth.continueToNewPassword')}
        </Button>
        <p className="text-center text-sm">
          <Link href="/login" className="text-primary hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </form>
    );
  }

  // step === 'newpassword'
  return (
    <form onSubmit={handleSetNewPassword} className="space-y-4">
      {error && (
        <p className="rounded bg-destructive/10 text-sm text-destructive">{error}</p>
      )}
      <div>
        <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1"
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('common.loading') : t('auth.setNewPassword')}
      </Button>
    </form>
  );
}
