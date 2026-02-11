'use client';

import Link from 'next/link';
import { useT } from '@/components/locale-provider';

const productLinkKeys = [
  { href: '/guide', labelKey: 'landing.footer.guide' },
  { href: '/docs', labelKey: 'landing.footer.documentation' },
  { href: '/login', labelKey: 'landing.footer.signIn' },
  { href: '/register', labelKey: 'landing.footer.getStarted' },
];

const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || '#';

export function LandingFooter() {
  const t = useT();
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
      </div>
    </footer>
  );
}
