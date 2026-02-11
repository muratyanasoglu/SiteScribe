'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useT } from '@/components/locale-provider';

export function LandingCta() {
  const t = useT();
  return (
    <section className="landing-mesh border-b border-border/60 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-4xl px-4 sm:px-8">
        <div className="landing-card relative overflow-hidden p-10 text-center sm:p-14 md:p-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" aria-hidden />
          <div className="relative">
            <h2
              className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
              style={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}
            >
              {t('landing.cta.heading')}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
              {t('landing.cta.subheading')}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="landing-cta-glow min-h-[52px] px-10 text-base font-semibold"
                >
                  {t('landing.cta.ctaPrimary')}
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[52px] border-2 px-10 text-base font-medium"
                >
                  {t('landing.cta.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
