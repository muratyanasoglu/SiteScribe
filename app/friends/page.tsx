import { getSession, getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { listIncomingFriendRequests, listOutgoingFriendRequests, listFriends } from '@/app/actions/friends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { Button } from '@/components/ui/button';
import { AddFriendForm } from './add-friend-form';
import { IncomingRequestRow } from './request-row';
import { SetUsernameForm } from './set-username-form';

export default async function FriendsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  const [currentUser, incoming, outgoing, friends] = await Promise.all([
    getCurrentUser(),
    listIncomingFriendRequests(),
    listOutgoingFriendRequests(),
    listFriends(),
  ]);
  const hasUsername = !!currentUser?.username;

  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-[60] p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex items-center gap-2">
          <MobileNavMenu>
            <LanguageSwitcher />
            <Link href="/guide" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.guide')}</Link>
            <Link href="/org">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('nav.organizations')}</Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('nav.chat')}</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('nav.notifications')}</Button>
            </Link>
            <Link href="/profile" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.profile')}</Link>
            <span className="text-sm text-muted-foreground truncate max-w-[180px] px-2 py-2 sm:py-0">{session.user?.email}</span>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">{t('nav.signOut')}</Button>
            </form>
          </MobileNavMenu>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
        <h2 className="text-2xl font-bold tracking-tight mb-6">{t('friends.title')}</h2>

        {!hasUsername && (
          <Card className="mb-6 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('friends.setUsernameTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('friends.usernameHint')}</p>
            </CardHeader>
            <CardContent>
              <SetUsernameForm />
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('friends.addFriend')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('friends.searchByUsername')}</p>
          </CardHeader>
          <CardContent>
            <AddFriendForm />
          </CardContent>
        </Card>

        {incoming.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('friends.incomingRequests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {incoming.map((req) => (
                  <IncomingRequestRow
                    key={req.id}
                    requestId={req.id}
                    fromUser={req.fromUser}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {outgoing.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('friends.outgoingRequests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {outgoing.map((req) => (
                  <li key={req.id} className="flex items-center gap-2 rounded-lg border border-border/80 p-3">
                    <span className="font-medium">{req.toUser.username ?? req.toUser.name ?? 'User'}</span>
                    <span className="text-sm text-muted-foreground">{t('friends.pendingSent')}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('friends.myFriends')}</CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('friends.noFriends')}</p>
            ) : (
              <ul className="space-y-2">
                {friends.map((u) => (
                  <li key={u.id} className="rounded-lg border border-border/80 p-3">
                    <span className="font-medium">{u.username ?? u.name ?? 'User'}</span>
                    {u.name && u.username && (
                      <span className="text-muted-foreground ml-2">({u.name})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
