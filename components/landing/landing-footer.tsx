'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/components/locale-provider';

const productLinkKeys = [
  { href: '/guide', labelKey: 'landing.footer.guide' },
  { href: '/docs', labelKey: 'landing.footer.documentation' },
  { href: '/login', labelKey: 'landing.footer.signIn' },
  { href: '/register', labelKey: 'landing.footer.getStarted' },
];

const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || '#';
const meredUrl = 'https://www.meredtechnology.com/';

export function LandingFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/40 py-14 sm:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <span
              className="font-bold text-foreground"
              style={{ letterSpacing: '-0.02em' }}
            >
              SiteScribe
            </span>
            <span className="text-sm text-muted-foreground">{t('landing.footer.openSourceFree')}</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-8">
            {productLinkKeys.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(l.labelKey)}
              </Link>
            ))}
            {githubUrl !== '#' && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            )}
          </nav>
        </div>
        <p className="mt-10 text-center text-sm leading-relaxed text-muted-foreground">
          {t('landing.footer.tagline')}
        </p>

        <div className="mt-10 rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <a
              href={meredUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl outline-none ring-offset-background transition hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Visit Mered Technology"
            >
              <Image
                src="/logo-light-mode.png"
                alt="Mered Technology logo (light mode)"
                width={220}
                height={60}
                className="h-10 w-auto object-contain dark:hidden sm:h-12"
                priority={false}
              />
              <Image
                src="/logo-dark-mode.png"
                alt="Mered Technology logo (dark mode)"
                width={220}
                height={60}
                className="hidden h-10 w-auto object-contain dark:block sm:h-12"
                priority={false}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t('landing.footer.mered.developedBy')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('landing.footer.mered.officialWebsite')}
                </p>
              </div>
            </a>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <a
                href={meredUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {t('landing.footer.mered.visitButton')}
              </a>
              <p className="text-xs leading-relaxed text-muted-foreground md:text-right">
                {year} {t('landing.footer.mered.rights')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
