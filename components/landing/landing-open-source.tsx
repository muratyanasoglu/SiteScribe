'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Code2, Shield, Heart } from 'lucide-react';
import { useT } from '@/components/locale-provider';

const pointKeys = [
  { icon: Code2, titleKey: 'landing.openSource.card1Title', descKey: 'landing.openSource.card1Desc' },
  { icon: Shield, titleKey: 'landing.openSource.card2Title', descKey: 'landing.openSource.card2Desc' },
  { icon: Heart, titleKey: 'landing.openSource.card3Title', descKey: 'landing.openSource.card3Desc' },
];

export function LandingOpenSource() {
  const t = useT();
  return (
    <section
      id="open-source"
      className="border-b border-border/60 py-20 sm:py-28 lg:py-32 bg-muted/30"
      aria-labelledby="opensource-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <h2 id="opensource-heading" className="landing-heading text-center text-foreground">
          {t('landing.openSource.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.openSource.subheading')}
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {pointKeys.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.titleKey}
                className="landing-card group flex flex-col items-center p-8 text-center"
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-2 ring-primary/10 transition-all group-hover:ring-primary/25">
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-semibold">{t(p.titleKey)}</CardTitle>
                <CardContent className="mt-3 p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {t(p.descKey)}
                  </p>
                </CardContent>
              </div>
            );
          })}
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="landing-cta-glow min-h-[52px] px-10 font-semibold">
              {t('landing.openSource.ctaPrimary')}
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="min-h-[52px] border-2 px-10 font-medium">
              {t('landing.openSource.ctaSecondary')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
