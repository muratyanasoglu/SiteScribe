'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export function GuideMermaid({ id, code }: { id: string; code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!code.trim() || !containerRef.current) return;
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const lineColor = isDark ? '#ffffff' : '#000000';
        const textColor = isDark ? '#e5e5e5' : '#1a1a1a';
        const fillColor = isDark ? '#262626' : '#f5f5f5';
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          sequence: { useMaxWidth: true },
          themeVariables: {
            primaryColor: fillColor,
            primaryTextColor: textColor,
            primaryBorderColor: lineColor,
            lineColor,
            secondaryColor: fillColor,
            tertiaryColor: fillColor,
          },
        });
        const uid = `mermaid-${id}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(uid, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Diagram failed to render');
      }
    })();
    return () => { cancelled = true; };
  }, [id, code, isDark]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        Diagram could not be rendered: {error}
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className="mermaid-container flex justify-center overflow-x-auto py-4 [&_svg]:max-w-full [&_svg]:bg-transparent"
      aria-label="Diagram"
    />
  );
}
