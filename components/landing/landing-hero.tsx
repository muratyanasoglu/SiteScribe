'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

export function LandingHero() {
  const t = useT();
  return (
    <section
      id="hero"
      className="landing-mesh relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background via-background to-muted/40 py-20 sm:py-28 lg:py-36"
      aria-label="Hero"
    >
      <div className="container relative mx-auto max-w-5xl px-4 text-center sm:px-8">
        <p className="landing-badge mb-6 inline-block">{t('landing.hero.badge')}</p>
        <h1
          className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
          style={{ letterSpacing: '-0.04em', lineHeight: 1.1 }}
        >
          {t('landing.hero.title')}{' '}
          <span className="landing-gradient-text">{t('landing.hero.titleHighlight')}</span>
          {t('landing.hero.titleSuffix') ? ` ${t('landing.hero.titleSuffix')}` : ''}
        </h1>
        <p className="landing-subheading mx-auto mt-8 text-center">
          {t('landing.hero.subtitle')}
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="landing-cta-glow min-h-[52px] px-10 text-base font-semibold"
            >
              {t('landing.hero.ctaPrimary')}
            </Button>
          </Link>
          <Link href="/guide">
            <Button
              variant="outline"
              size="lg"
              className="min-h-[52px] border-2 px-10 text-base font-medium"
            >
              {t('landing.hero.ctaSecondary')}
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          {t('landing.hero.noCard')}
        </p>
      </div>
    </section>
  );
}
