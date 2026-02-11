export const LOCALES = ['en', 'es', 'fr', 'tr'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  tr: 'Türkçe',
};

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export type Messages = typeof import('@/messages/en.json');

export async function getMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case 'es':
      return (await import('@/messages/es.json')).default;
    case 'fr':
      return (await import('@/messages/fr.json')).default;
    case 'tr':
      return (await import('@/messages/tr.json')).default;
    default:
      return (await import('@/messages/en.json')).default;
  }
}

/** Get locale from cookie (use in Server Components / layout). */
export async function getLocaleFromCookie(): Promise<Locale> {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isValidLocale(value) ? value : DEFAULT_LOCALE;
}

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/** Create t() for use in Server Components. Pass messages from getMessages(locale). */
export function createT(messages: Messages): (key: string) => string {
  return (key: string) => getNested(messages as Record<string, unknown>, key) ?? key;
}
