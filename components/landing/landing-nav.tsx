'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileNavMenu } from '@/components/mobile-nav-menu';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

export function LandingNav() {
  const t = useT();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-foreground tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="text-xl tracking-tight sm:text-2xl" style={{ letterSpacing: '-0.03em' }}>
            SiteScribe
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <MobileNavMenu>
            <Link
              href="/guide"
              className="nav-link min-h-[44px] flex items-center sm:min-h-0 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {t('landing.nav.guide')}
            </Link>
            <Link
              href="/docs"
              className="nav-link min-h-[44px] flex items-center sm:min-h-0 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {t('landing.nav.docs')}
            </Link>
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start sm:justify-center font-medium min-h-[44px] sm:min-h-0">{t('landing.nav.signIn')}</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="w-full sm:w-auto justify-start sm:justify-center font-semibold shadow-sm min-h-[44px] sm:min-h-0">{t('landing.nav.getStarted')}</Button>
            </Link>
          </MobileNavMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
