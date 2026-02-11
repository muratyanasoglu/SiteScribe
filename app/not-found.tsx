import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-foreground">{t('common.notFoundTitle')}</h1>
        <p className="text-muted-foreground text-sm">{t('common.notFoundDescription')}</p>
        <Button asChild>
          <Link href="/">{t('common.backHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
