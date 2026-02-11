'use client';

import Link from 'next/link';
import { useT } from '@/components/locale-provider';

export function LandingHowItWorks() {
  const t = useT();
  const flow = [
    { labelKey: 'landing.howItWorks.evidence', subKey: 'landing.howItWorks.evidenceSub' },
    { labelKey: 'landing.howItWorks.signals', subKey: 'landing.howItWorks.signalsSub' },
    { labelKey: 'landing.howItWorks.events', subKey: 'landing.howItWorks.eventsSub' },
    { labelKey: 'landing.howItWorks.coDraft', subKey: 'landing.howItWorks.coDraftSub' },
    { labelKey: 'landing.howItWorks.export', subKey: 'landing.howItWorks.exportSub' },
  ];
  return (
    <section
      id="how-it-works"
      className="border-b border-border/60 py-20 sm:py-28 lg:py-32"
      aria-labelledby="how-heading"
    >
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <h2 id="how-heading" className="landing-heading text-center text-foreground">
          {t('landing.howItWorks.heading')}
        </h2>
        <p className="landing-subheading mx-auto mt-5 text-center">
          {t('landing.howItWorks.subheading')}
        </p>
        <div className="mt-16 flex flex-wrap items-stretch justify-center gap-2 sm:gap-4">
          {flow.map((item, i) => (
            <div key={item.labelKey} className="flex items-center gap-2 sm:gap-4">
              <div className="landing-card flex min-w-[110px] flex-col justify-center px-5 py-4 text-center sm:min-w-[130px] sm:px-6 sm:py-5">
                <p className="font-semibold text-foreground sm:text-lg">{t(item.labelKey)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t(item.subKey)}</p>
              </div>
              {i < flow.length - 1 && (
                <span
                  className="hidden shrink-0 text-2xl font-light text-primary/60 sm:inline"
                  aria-hidden
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-12 text-center">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {t('landing.howItWorks.linkText')}
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
