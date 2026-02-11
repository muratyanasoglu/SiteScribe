import { getSession } from '@/lib/auth-server';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { GuideMermaid } from '@/components/guide-mermaid';

export default async function GuidePage() {
  const session = await getSession();
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);

  return (
    <div className="min-h-screen bg-background">
      <header className="page-header sticky top-0 z-30 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">{t('guide.backHome')}</Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('nav.guideTitle')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/org">
                <Button variant="ghost" size="sm">{t('nav.organizations')}</Button>
              </Link>
              <Link href="/projects">
                <Button variant="ghost" size="sm">{t('nav.projects')}</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('auth.signIn')}</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t('auth.register')}</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto min-w-0 overflow-x-hidden space-y-10 pb-12">
        {/* Intro */}
        <section className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3">{t('guide.whatIs')}</h2>
          <p className="text-muted-foreground">
            {t('guide.whatIsDesc')}
          </p>
        </section>

        {/* High-level flow */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-3">{t('guide.howItWorks')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('guide.howItWorksDesc')}
          </p>
          <GuideMermaid
            id="flow-main"
            code={`flowchart LR
  A[Upload Evidence] --> B[Run Detection]
  B --> C[Signals & Events]
  C --> D[Generate CO Draft]
  D --> E[Edit CO]
  E --> F[Export PDF + ZIP]
  F --> G[Send / Approve]`}
          />
        </section>

        {/* Getting started */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-3">{t('guide.gettingStarted')}</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>{t('guide.gettingStartedDesc1')}</li>
            <li>{t('guide.gettingStartedDesc2')}</li>
            <li>{t('guide.gettingStartedDesc3')}</li>
            <li>{t('guide.gettingStartedDesc4')}</li>
          </ul>
        </section>

        {/* Link to full documentation */}
        <section className="pt-4">
          <Link href="/docs">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {t('guide.readFullDocs')}
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
