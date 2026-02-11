import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { fetchNotifications, fetchUnreadCount } from '@/app/actions/notifications';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { NotificationsList } from './notifications-list';

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [locale, notifications, unreadCount] = await Promise.all([
    getLocaleFromCookie(),
    fetchNotifications(30),
    fetchUnreadCount(),
  ]);
  const messages = await getMessages(locale);
  const t = createT(messages);
  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/guide" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.guide')}</Link>
          <Link href="/org" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.organizations')}</Link>
          <Link href="/projects" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.projects')}</Link>
          <span className="text-sm text-muted-foreground truncate max-w-[160px] sm:max-w-none">{session.user?.email}</span>
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav.notifications')}</h2>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">{unreadCount} {t('co.unread')}</span>
          )}
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('co.allNotifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationsList notifications={notifications} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
