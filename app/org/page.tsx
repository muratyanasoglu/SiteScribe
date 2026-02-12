import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { getOrganizations } from '@/app/actions/org';
import { listInvitations } from '@/app/actions/invite';
import { listFriendsNotInOrg } from '@/app/actions/friends';
import { fetchUnreadCount } from '@/app/actions/notifications';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { InvitationsList } from './invitations-list';

export default async function OrgPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const [locale, list, unreadCount] = await Promise.all([
    getLocaleFromCookie(),
    getOrganizations(),
    fetchUnreadCount(),
  ]);
  const messages = await getMessages(locale);
  const t = createT(messages);
  const listWithInvitations = await Promise.all(
    list.map(async ({ org, role }) => ({
      org,
      role,
      invitations: role === 'OWNER' ? await listInvitations(org.id) : [],
      friendsNotInOrg: role === 'OWNER' ? await listFriendsNotInOrg(org.id) : [],
    }))
  );
  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-[60] p-4 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex items-center gap-2">
          <MobileNavMenu>
            <LanguageSwitcher />
            <Link href="/guide" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.guide')}</Link>
            <Link href="/friends" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.friends')}</Link>
            <Link href="/chat" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.chat')}</Link>
            <Link href="/notifications" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.notifications')}{unreadCount > 0 ? ` (${unreadCount})` : ''}</Link>
            <Link href="/profile" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.profile')}</Link>
            <span className="text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none px-2 py-2 sm:py-0">{session.user?.email}</span>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">{t('nav.signOut')}</Button>
            </form>
          </MobileNavMenu>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-4xl mx-auto min-w-0 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('org.organizations')}</h2>
          <CreateOrgButton />
        </div>
        <div className="grid gap-5">
          {listWithInvitations.length === 0 && (
            <p className="text-muted-foreground text-base">{t('org.noOrgs')}</p>
          )}
          {listWithInvitations.map(({ org, role, invitations, friendsNotInOrg }) => (
            <Card key={org.id} className="card-interactive">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{org.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('org.role')}: {role}</p>
              </CardHeader>
              <CardContent>
                <Link href={`/projects?org=${org.id}`}>
                  <Button variant="outline" size="sm">{t('nav.viewProjects')}</Button>
                </Link>
                {role === 'OWNER' && (
                  <Link href={`/org/webhooks?org=${org.id}`} className="inline-block mt-1">
                    <Button variant="outline" size="sm">{t('nav.webhooks')}</Button>
                  </Link>
                )}
                <InviteForm organizationId={org.id} isOwner={role === 'OWNER'} friendsNotInOrg={friendsNotInOrg} />
                <InvitationsList organizationId={org.id} invitations={invitations} />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

import { CreateOrgForm } from './create-org-form';
import { InviteForm } from './invite-form';

function CreateOrgButton() {
  return (
    <CreateOrgForm />
  );
}
