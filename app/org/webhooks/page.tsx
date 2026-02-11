import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getOrganizations } from '@/app/actions/org';
import { listWebhooks } from '@/app/actions/webhooks';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { WebhookForm } from './webhook-form';
import { WebhookRow } from './webhook-row';

export default async function OrgWebhooksPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/login');
  const { org: orgId } = await searchParams;
  const [locale, list] = await Promise.all([getLocaleFromCookie(), getOrganizations()]);
  const messages = await getMessages(locale);
  const t = createT(messages);
  const ownerOrgs = list.filter(({ role }) => role === 'OWNER');

  if (!orgId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
          <div className="flex items-center gap-2">
            <MobileNavMenu>
              <LanguageSwitcher />
              <Link href="/org" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.backToOrganizations')}</Link>
            </MobileNavMenu>
            <ThemeToggle />
          </div>
        </header>
        <main className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0 overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{t('org.webhookManagement')}</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {t('org.selectOrgForWebhooks')}
          </p>
          {ownerOrgs.length === 0 ? (
            <p className="text-muted-foreground">{t('org.noOrgsToManage')}</p>
          ) : (
            <ul className="space-y-2">
              {ownerOrgs.map(({ org }) => (
                <li key={org.id}>
                  <Link
                    href={`/org/webhooks?org=${org.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {org.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    );
  }

  const isOwner = ownerOrgs.some(({ org }) => org.id === orgId);
  if (!isOwner) redirect('/org');
  const [webhooks, orgName] = await Promise.all([
    listWebhooks(orgId),
    list.find(({ org }) => org.id === orgId)?.org.name ?? 'Organization',
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.siteScribe')}</h1>
        <div className="flex items-center gap-2">
          <MobileNavMenu>
            <LanguageSwitcher />
            <Link href="/org" className="nav-link min-h-[44px] flex items-center sm:min-h-0">{t('nav.backToOrganizations')}</Link>
          </MobileNavMenu>
          <ThemeToggle />
        </div>
      </header>
      <main className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0 overflow-x-hidden">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{t('nav.webhooks')}</h2>
        <p className="text-muted-foreground text-sm mb-4">{orgName}</p>

        <Card className="card-interactive">
          <CardHeader>
            <CardTitle className="text-base">{t('org.newWebhook')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('org.webhookNewDescription')}
            </p>
          </CardHeader>
          <CardContent>
            <WebhookForm organizationId={orgId} />
          </CardContent>
        </Card>

        <Card className="mt-5 card-interactive">
          <CardHeader>
            <CardTitle className="text-base">{t('org.existingWebhooks')}</CardTitle>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('org.noWebhooksYet')}</p>
            ) : (
              <ul className="space-y-2">
                {webhooks.map((wh) => (
                  <WebhookRow key={wh.id} webhook={wh} organizationId={orgId} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
