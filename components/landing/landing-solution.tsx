'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/components/locale-provider';

export function LandingSolution() {
  const t = useT();
  const steps = [
    { step: 1, titleKey: 'landing.solution.step1Title', bodyKey: 'landing.solution.step1Body' },
    { step: 2, titleKey: 'landing.solution.step2Title', bodyKey: 'landing.solution.step2Body' },
    { step: 3, titleKey: 'landing.solution.step3Title', bodyKey: 'landing.solution.step3Body' },
    { step: 4, titleKey: 'landing.solution.step4Title', bodyKey: 'landing.solution.step4Body' },
  ];
  return (
    <section className="border-b border-border/60 py-20 sm:py-28 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <h2 className="landing-heading text-center text-foreground">
          {t('landing.solution.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.solution.subheading')}
        </p>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="landing-card group relative overflow-hidden p-6 sm:p-7">
              <span className="absolute right-4 top-4 text-5xl font-bold tabular-nums text-primary/10 group-hover:text-primary/20">
                {s.step}
              </span>
              <CardHeader className="relative p-0 pb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {t('landing.solution.step')} {s.step}
                </span>
                <CardTitle className="text-lg font-semibold leading-snug sm:text-xl">
                  {t(s.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-0">
                <p className="text-muted-foreground leading-relaxed">
                  {t(s.bodyKey)}
                </p>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
