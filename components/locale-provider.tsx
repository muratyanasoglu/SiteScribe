'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  type Locale,
  type Messages,
  LOCALE_COOKIE,
  DEFAULT_LOCALE,
  isValidLocale,
  getMessages,
  LOCALES,
} from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  messages: Messages;
  t: (key: string) => string;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function LocaleProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: Locale;
  initialMessages: Messages;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (!isValidLocale(next) || next === locale) return;
      startTransition(() => {
        setLocaleState(next);
        if (typeof document !== 'undefined') {
          document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
        }
        getMessages(next).then((nextMessages) => {
          setMessages(nextMessages);
          router.refresh();
        });
      });
    },
    [locale, router]
  );

  const t = useCallback(
    (key: string) => {
      const value = getNested(messages as Record<string, unknown>, key);
      return value ?? key;
    },
    [messages]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, messages, t, isPending }),
    [locale, setLocale, messages, t, isPending]
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT() {
  const { t } = useLocale();
  return t;
}

export { LOCALES };
