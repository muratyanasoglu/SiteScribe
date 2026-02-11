import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession } from '@/lib/auth-server';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { Button } from '@/components/ui/button';
import { GuideMermaid } from '@/components/guide-mermaid';

export const metadata: Metadata = {
  title: 'Documentation – SiteScribe',
  description:
    'Complete documentation for SiteScribe: how to use every feature, from evidence and signals to Change Orders and exports. Simple language and diagrams.',
};

export default async function DocsPage() {
  const session = await getSession();
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">{t('docs.backHome')}</Button>
            </Link>
            <Link href="/" className="font-bold text-foreground tracking-tight hover:underline">
              SiteScribe
            </Link>
            <span className="text-sm text-muted-foreground">{t('docs.pageTitle')}</span>
          </div>
          <div className="flex items-center gap-2">
            <MobileNavMenu>
              <LanguageSwitcher />
              <Link href="/guide">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('docs.navGuide')}</Button>
              </Link>
              {session ? (
                <Link href="/org">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('docs.navApp')}</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="w-full sm:w-auto justify-start sm:justify-center min-h-[44px] sm:min-h-0">{t('docs.navSignIn')}</Button>
                </Link>
              )}
            </MobileNavMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-12 pb-16 overflow-x-hidden">
        <section id="intro" className="scroll-mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('docs.introTitle')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {t('docs.introDesc')}
          </p>
        </section>

        <nav aria-label="Documentation sections" className="rounded-xl border border-border/80 bg-muted/30 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {t('docs.onThisPage')}
          </h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#what-is" className="text-primary hover:underline">{t('docs.linkWhatIs')}</a></li>
            <li><a href="#purpose" className="text-primary hover:underline">{t('docs.linkPurpose')}</a></li>
            <li><a href="#getting-started" className="text-primary hover:underline">{t('docs.linkGettingStarted')}</a></li>
            <li><a href="#main-flow" className="text-primary hover:underline">{t('docs.linkMainFlow')}</a></li>
            <li><a href="#organizations" className="text-primary hover:underline">{t('docs.linkOrganizations')}</a></li>
            <li><a href="#projects" className="text-primary hover:underline">{t('docs.linkProjects')}</a></li>
            <li><a href="#evidence" className="text-primary hover:underline">{t('docs.linkEvidence')}</a></li>
            <li><a href="#signals" className="text-primary hover:underline">{t('docs.linkSignals')}</a></li>
            <li><a href="#change-orders" className="text-primary hover:underline">{t('docs.linkChangeOrders')}</a></li>
            <li><a href="#search" className="text-primary hover:underline">{t('docs.linkSearch')}</a></li>
            <li><a href="#exports" className="text-primary hover:underline">{t('docs.linkExports')}</a></li>
            <li><a href="#templates" className="text-primary hover:underline">{t('docs.linkTemplates')}</a></li>
            <li><a href="#scheduled" className="text-primary hover:underline">{t('docs.linkScheduled')}</a></li>
            <li><a href="#notifications" className="text-primary hover:underline">{t('docs.linkNotifications')}</a></li>
            <li><a href="#webhooks" className="text-primary hover:underline">{t('docs.linkWebhooks')}</a></li>
            <li><a href="#ai" className="text-primary hover:underline">{t('docs.linkAi')}</a></li>
            <li><a href="#quick-ref" className="text-primary hover:underline">{t('docs.linkQuickRef')}</a></li>
          </ul>
        </nav>

        <section id="what-is" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.whatIsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.whatIsP1')}
          </p>
          <p className="mt-3 text-muted-foreground">
            {t('docs.whatIsP2')}
          </p>
        </section>

        <section id="purpose" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.purposeTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.purposeP1')}
          </p>
          <p className="mt-3 text-muted-foreground">
            {t('docs.purposeP2')}
          </p>
        </section>

        <section id="getting-started" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.gettingStartedTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.gettingStartedP')}
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-6 text-muted-foreground">
            <li>{t('docs.gettingStartedL1')}</li>
            <li>{t('docs.gettingStartedL2')}</li>
            <li>{t('docs.gettingStartedL3')}</li>
            <li>{t('docs.gettingStartedL4')}</li>
          </ol>
          <div className="mt-6">
            <GuideMermaid
              id="docs-getting-started"
              code={`flowchart LR
  A[Register] --> B[Sign in]
  B --> C[Create organization]
  C --> D[Create project]
  D --> E[Upload evidence]`}
            />
          </div>
        </section>

        {/* Main workflow */}
        <section id="main-flow" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.mainFlowTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.mainFlowP')} You don’t have to do every step every time, but this is the main flow.
          </p>
          <div className="mt-6">
            <GuideMermaid
              id="docs-main-flow"
              code={`flowchart LR
  A[Upload Evidence] --> B[Run Detection]
  B --> C[Signals & Events]
  C --> D[Generate CO Draft]
  D --> E[Edit CO]
  E --> F[Export PDF + ZIP]
  F --> G[Send / Approve]`}
            />
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.mainFlowL1')}</li>
            <li>{t('docs.mainFlowL2')}</li>
            <li>{t('docs.mainFlowL3')}</li>
            <li>{t('docs.mainFlowL4')}</li>
            <li>{t('docs.mainFlowL5')}</li>
            <li>{t('docs.mainFlowL6')}</li>
          </ul>
        </section>

        <section id="organizations" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.orgTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.orgP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.orgHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.orgL1')}</li>
            <li>{t('docs.orgL2')}</li>
            <li>{t('docs.orgL3')}</li>
          </ul>
          <h3 className="mt-4 text-lg font-semibold text-foreground">{t('docs.orgRoles')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.orgR1')}</li>
            <li>{t('docs.orgR2')}</li>
            <li>{t('docs.orgR3')}</li>
            <li>{t('docs.orgR4')}</li>
            <li>{t('docs.orgR5')}</li>
          </ul>
          <div className="mt-6">
            <GuideMermaid
              id="docs-org"
              code={`flowchart TB
  subgraph Org
    O[Organization]
    O --> P1[Project 1]
    O --> P2[Project 2]
    O --> Inv[Invitations]
    O --> WH[Webhooks]
  end
  P1 --> E1[Evidence]
  P1 --> S1[Signals / COs]
  P2 --> E2[Evidence]
  P2 --> S2[Signals / COs]`}
            />
          </div>
        </section>

        <section id="projects" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.projectsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.projectsP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.projectsHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.projectsL1')}</li>
            <li>{t('docs.projectsL2')}</li>
            <li>{t('docs.projectsL3')}</li>
          </ul>
        </section>

        <section id="evidence" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.evidenceTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.evidenceP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.evidenceTypes')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.evidenceT1')}</li>
            <li>{t('docs.evidenceT2')}</li>
            <li>{t('docs.evidenceT3')}</li>
            <li>{t('docs.evidenceT4')}</li>
            <li>{t('docs.evidenceT5')}</li>
          </ul>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.evidenceHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.evidenceL1')}</li>
            <li>{t('docs.evidenceL2')}</li>
            <li>{t('docs.evidenceL3')}</li>
            <li>{t('docs.evidenceL4')}</li>
          </ul>
          <div className="mt-6">
            <GuideMermaid
              id="docs-evidence"
              code={`flowchart LR
  U[Upload] --> T[Choose type]
  T --> SITE_LOG[Site log]
  T --> PHOTO[Photo]
  T --> RFI[RFI]
  T --> PLAN[Plan rev]
  T --> CONTRACT[Contract]
  SITE_LOG --> STORE[(Evidence)]
  PHOTO --> STORE
  RFI --> STORE
  PLAN --> STORE
  CONTRACT --> STORE
  STORE --> LINKS[Links]
  STORE --> COMPARE[Plan compare]`}
            />
          </div>
        </section>

        <section id="signals" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.signalsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.signalsP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.signalsHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.signalsL1')}</li>
            <li>{t('docs.signalsL2')}</li>
            <li>{t('docs.signalsL3')}</li>
          </ul>
          <div className="mt-6">
            <GuideMermaid
              id="docs-signals"
              code={`flowchart TB
  Evidence[Evidence] --> Detect[Run detection]
  Detect --> Signals[Signals]
  Signals --> Group[Group by date/type]
  Group --> Events[Events]
  Events --> Status[Set status]
  Events --> Draft[Generate CO draft]
  Draft --> CO[Change Order]`}
            />
          </div>
        </section>

        <section id="change-orders" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.coTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.coP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.coFields')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.coF1')}</li>
            <li>{t('docs.coF2')}</li>
            <li>{t('docs.coF3')}</li>
          </ul>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.coHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.coL1')}</li>
            <li>{t('docs.coL2')}</li>
            <li>{t('docs.coL3')}</li>
            <li>{t('docs.coL4')}</li>
            <li>{t('docs.coL5')}</li>
          </ul>
          <div className="mt-6">
            <GuideMermaid
              id="docs-co"
              code={`stateDiagram-v2
  [*] --> Draft: Generate from event
  Draft --> Editing: Edit scope, line items
  Editing --> Enriched: Enrich with AI (optional)
  Enriched --> Editing: Adjust
  Editing --> Exported: Export PDF + ZIP
  Exported --> [*]`}
            />
          </div>
        </section>

        <section id="search" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.searchTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.searchP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.searchHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.searchL1')}</li>
            <li>{t('docs.searchL2')}</li>
            <li>{t('docs.searchL3')}</li>
          </ul>
        </section>

        <section id="exports" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.exportsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.exportsP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.exportsHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.exportsL1')}</li>
            <li>{t('docs.exportsL2')}</li>
            <li>{t('docs.exportsL3')}</li>
          </ul>
        </section>

        <section id="templates" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.templatesTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.templatesP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.templatesHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.templatesL1')}</li>
            <li>{t('docs.templatesL2')}</li>
          </ul>
        </section>

        <section id="scheduled" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.scheduledTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.scheduledP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.scheduledHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.scheduledL1')}</li>
            <li>{t('docs.scheduledL2')}</li>
          </ul>
        </section>

        <section id="notifications" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.notificationsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.notificationsP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.notificationsHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.notificationsL1')}</li>
            <li>{t('docs.notificationsL2')}</li>
          </ul>
        </section>

        <section id="webhooks" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.webhooksTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.webhooksP')}
          </p>
          <h3 className="mt-6 text-lg font-semibold text-foreground">{t('docs.webhooksHowTo')}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.webhooksL1')}</li>
            <li>{t('docs.webhooksL2')}</li>
          </ul>
        </section>

        <section id="ai" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.aiTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('docs.aiP')}
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-6 text-muted-foreground">
            <li>{t('docs.aiL1')}</li>
            <li>{t('docs.aiL2')}</li>
            <li>{t('docs.aiL3')}</li>
            <li>{t('docs.aiL4')}</li>
          </ul>
        </section>

        <section id="quick-ref" className="scroll-mt-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/80 pb-2">
            {t('docs.quickRefTitle')}
          </h2>
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/30 p-5 text-sm text-muted-foreground space-y-3">
            <p>{t('docs.quickRefE')}</p>
            <p>{t('docs.quickRefR')}</p>
            <p>{t('docs.quickRefF')}</p>
            <p>{t('docs.quickRefW')}</p>
            <p>{t('docs.quickRefX')}</p>
          </div>
        </section>

        <p className="pt-8 text-center text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">{t('docs.backHome')}</Link>
          {' · '}
          <Link href="/guide" className="text-primary hover:underline">{t('docs.shortGuide')}</Link>
          {' · '}
          {session ? (
            <Link href="/org" className="text-primary hover:underline">{t('docs.openApp')}</Link>
          ) : (
            <Link href="/login" className="text-primary hover:underline">{t('docs.navSignIn')}</Link>
          )}
        </p>
      </main>
    </div>
  );
}
