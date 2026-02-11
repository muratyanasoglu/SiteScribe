'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
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
        <nav className="flex items-center gap-1 sm:gap-6">
          <Link
            href="/guide"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {t('landing.nav.guide')}
          </Link>
          <Link
            href="/docs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            {t('landing.nav.docs')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-medium">{t('landing.nav.signIn')}</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="font-semibold shadow-sm">{t('landing.nav.getStarted')}</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
