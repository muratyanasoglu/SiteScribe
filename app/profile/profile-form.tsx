'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/components/locale-provider';
import { updateProfile, updatePassword, setPassword, updateSecurityQuestion } from '@/app/actions/profile';
import { SECURITY_QUESTION_KEYS } from '@/lib/validation';

type Profile = {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  securityQuestionKey: string | null;
  hasPassword: boolean;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useT();
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [setPasswordError, setSetPasswordError] = useState('');
  const [setPasswordSuccess, setSetPasswordSuccess] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);

  async function handleSetPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSetPasswordError('');
    setSetPasswordSuccess(false);
    setSetPasswordLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await setPassword(formData);
    setSetPasswordLoading(false);
    if (result?.error) {
      setSetPasswordError(result.error);
      return;
    }
    setSetPasswordSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setProfileLoading(false);
    if (result?.error) {
      setProfileError(result.error);
      return;
    }
    if (result?.emailChanged) {
      await signOut({ callbackUrl: '/login?emailChanged=1' });
      return;
    }
    setProfileSuccess(true);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);
    setPasswordLoading(false);
    if (result?.error) {
      setPasswordError(result.error);
      return;
    }
    setPasswordSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  async function handleSecuritySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);
    setSecurityLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSecurityQuestion(formData);
    setSecurityLoading(false);
    if (result?.error) {
      setSecurityError(result.error);
      return;
    }
    setSecuritySuccess(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('profile.accountInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileError && (
              <p className="rounded bg-destructive/10 text-sm text-destructive">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">{t('profile.profileUpdated')}</p>
            )}
            <div>
              <Label htmlFor="profile-name">{t('profile.name')}</Label>
              <Input
                id="profile-name"
                name="name"
                type="text"
                defaultValue={profile.name ?? ''}
                className="mt-1"
                placeholder={t('profile.namePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="profile-email">{t('auth.email')}</Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                required
                defaultValue={profile.email}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('profile.emailChangeNote')}</p>
            </div>
            <div>
              <Label htmlFor="profile-username">{t('friends.username')}</Label>
              <Input
                id="profile-username"
                name="username"
                type="text"
                defaultValue={profile.username ?? ''}
                className="mt-1"
                placeholder={t('friends.usernamePlaceholder')}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('friends.usernameHint')}</p>
            </div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? t('common.loading') : t('profile.saveProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.hasPassword ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('profile.changePassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <p className="rounded bg-destructive/10 text-sm text-destructive">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">{t('profile.passwordUpdated')}</p>
              )}
              <div>
                <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? t('common.loading') : t('profile.savePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('profile.setPassword')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('profile.setPasswordHint')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              {setPasswordError && (
                <p className="rounded bg-destructive/10 text-sm text-destructive">{setPasswordError}</p>
              )}
              {setPasswordSuccess && (
                <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">{t('profile.passwordUpdated')}</p>
              )}
              <div>
                <Label htmlFor="setNewPassword">{t('auth.newPassword')}</Label>
                <Input
                  id="setNewPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={setPasswordLoading}>
                {setPasswordLoading ? t('common.loading') : t('profile.savePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('profile.securityQuestion')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('auth.securityQuestionHint')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            {securityError && (
              <p className="rounded bg-destructive/10 text-sm text-destructive">{securityError}</p>
            )}
            {securitySuccess && (
              <p className="rounded bg-green-500/10 text-sm text-green-700 dark:text-green-400">{t('profile.securityUpdated')}</p>
            )}
            <div>
              <Label htmlFor="securityQuestionKey" className="sr-only">{t('auth.securityQuestionLabel')}</Label>
              <select
                id="securityQuestionKey"
                name="securityQuestionKey"
                required
                defaultValue={profile.securityQuestionKey ?? ''}
                className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">{t('auth.securityQuestionChoose')}</option>
                {SECURITY_QUESTION_KEYS.map((key) => (
                  <option key={key} value={key}>{t(`auth.securityQuestion_${key}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="profile-securityAnswer">{t('auth.securityAnswer')}</Label>
              <Input
                id="profile-securityAnswer"
                name="securityAnswer"
                type="text"
                required
                autoComplete="off"
                className="mt-1"
                placeholder={t('auth.securityAnswerPlaceholder')}
              />
            </div>
            <Button type="submit" disabled={securityLoading}>
              {securityLoading ? t('common.loading') : t('profile.saveSecurity')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
