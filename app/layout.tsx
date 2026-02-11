import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast-provider';
import { LocaleProvider } from '@/components/locale-provider';
import { HelpChatWidget } from '@/components/help-chat-widget';
import { ScrollToTop } from '@/components/scroll-to-top';
import { getLocaleFromCookie, getMessages } from '@/lib/i18n';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SiteScribe – Change Order Copilot',
  description: 'Evidence-backed Change Order management for construction',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={plusJakarta.variable + ' font-sans'}>
        <LocaleProvider initialLocale={locale} initialMessages={messages}>
          <ThemeProvider>
            <SessionProvider>
              <ToastProvider>
                {children}
                <ScrollToTop />
                <HelpChatWidget />
              </ToastProvider>
            </SessionProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
