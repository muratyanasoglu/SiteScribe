'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useT } from '@/components/locale-provider';

type NavItem = { href: string; labelKey: string; unreadCount?: number };

export function ProjectLayoutClient({
  base,
  nav,
  projectName,
  children,
}: {
  base: string;
  nav: NavItem[];
  projectName: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();

  const navContentWithoutTheme = (
    <>
      <div className="flex items-center gap-2 py-2 flex-wrap">
        <LanguageSwitcher />
      </div>
      <Link href="/projects" className="nav-link py-2.5 -ml-1 block" onClick={() => setMenuOpen(false)}>
        {t('nav.backToProjects')}
      </Link>
      <Link href="/guide" className="nav-link py-2.5 -ml-1 block" onClick={() => setMenuOpen(false)}>
        {t('nav.guide')}
      </Link>
      <h3 className="font-semibold truncate py-2 text-foreground" title={projectName}>
        {projectName}
      </h3>
      <nav className="flex flex-col gap-0.5">
        {nav.map(({ href, labelKey, unreadCount }) => (
          <Link
            key={href}
            href={href}
            className="nav-link min-h-[44px] flex items-center"
            onClick={() => setMenuOpen(false)}
          >
            {unreadCount != null && unreadCount > 0 ? `${t(labelKey)} (${unreadCount})` : t(labelKey)}
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile: menu button */}
      <header className="md:hidden flex items-center justify-between page-header px-4 py-3 sticky top-0 z-[60]">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-semibold truncate max-w-[180px]">{projectName}</span>
        <ThemeToggle />
      </header>

      {/* Mobile: drawer overlay + panel (animated) */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200 ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed top-0 left-0 w-72 max-w-[85vw] h-full bg-card border-r border-border/80 shadow-soft-lg z-50 p-5 flex flex-col gap-2 overflow-y-auto md:hidden transition-transform duration-200 ease-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {navContentWithoutTheme}
      </aside>

      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border/80 bg-card/30 p-5 flex-col gap-1">
        <div className="flex items-center gap-2 py-2 flex-wrap">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <Link href="/projects" className="nav-link py-2.5 -ml-1 block">
          {t('nav.backToProjects')}
        </Link>
        <Link href="/guide" className="nav-link py-2.5 -ml-1 block">
          {t('nav.guide')}
        </Link>
        <h3 className="font-semibold truncate py-2 text-foreground" title={projectName}>
          {projectName}
        </h3>
        <nav className="flex flex-col gap-0.5">
          {nav.map(({ href, labelKey, unreadCount }) => (
            <Link
              key={href}
              href={href}
              className="nav-link min-h-[44px] flex items-center"
            >
              {unreadCount != null && unreadCount > 0 ? `${t(labelKey)} (${unreadCount})` : t(labelKey)}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
