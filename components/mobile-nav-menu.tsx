'use client';

import { useState } from 'react';

interface MobileNavMenuProps {
  children: React.ReactNode;
}

export function MobileNavMenu({ children }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: nav links visible */}
      <div className="hidden sm:flex flex-wrap gap-2 items-center justify-end sm:justify-between overflow-x-auto overflow-y-hidden py-1 -mx-1">
        {children}
      </div>
      {/* Mobile: hamburger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted active:bg-muted/80 touch-manipulation"
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {/* Mobile: overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 sm:hidden transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      {/* Mobile: drawer */}
      <div
        className={`fixed top-0 right-0 w-72 max-w-[85vw] h-full bg-background border-l border-border shadow-lg z-50 flex flex-col sm:hidden transition-transform duration-200 ease-out ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/80 shrink-0">
          <span className="font-semibold text-sm text-muted-foreground">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted touch-manipulation"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          {children}
        </nav>
      </div>
    </>
  );
}
