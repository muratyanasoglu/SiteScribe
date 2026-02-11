'use client';

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useT } from '@/components/locale-provider';

export function LandingProblem() {
  const t = useT();
  const problems = [
    { titleKey: 'landing.problem.card1Title', descKey: 'landing.problem.card1Desc' },
    { titleKey: 'landing.problem.card2Title', descKey: 'landing.problem.card2Desc' },
    { titleKey: 'landing.problem.card3Title', descKey: 'landing.problem.card3Desc' },
  ];
  return (
    <section
      id="problem"
      className="border-b border-border/60 py-20 sm:py-28 lg:py-32 bg-muted/30"
      aria-labelledby="problem-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex justify-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </span>
        </div>
        <h2 id="problem-heading" className="landing-heading text-center text-foreground">
          {t('landing.problem.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.problem.subheading')}
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <div key={p.titleKey} className="landing-card p-6 sm:p-7">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-semibold leading-snug sm:text-xl">
                  {t(p.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground leading-relaxed">
                  {t(p.descKey)}
                </p>
              </CardContent>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
