import { getSession, getProfile } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const profile = await getProfile();
  if (!profile) redirect('/login');
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);

  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex items-center gap-2">
          <MobileNavMenu>
            <LanguageSwitcher />
            <Link href="/guide" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.guide')}</Link>
            <Link href="/org" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.organizations')}</Link>
            <Link href="/friends" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.friends')}</Link>
            <Link href="/chat" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.chat')}</Link>
            <Link href="/notifications" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.notifications')}</Link>
            <span className="text-sm text-muted-foreground truncate max-w-[180px] px-2 py-2 sm:py-0">{session.user?.email}</span>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">{t('nav.signOut')}</Button>
            </form>
          </MobileNavMenu>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
        <h2 className="text-2xl font-bold tracking-tight mb-6">{t('profile.title')}</h2>
        <ProfileForm profile={profile} />
      </main>
    </div>
  );
}
