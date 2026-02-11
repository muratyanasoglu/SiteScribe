import { acceptInvite } from '@/app/actions/invite';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLocaleFromCookie, getMessages, createT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);
  const t = createT(messages);
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="rounded-2xl border border-border/80 bg-card/95 p-6 sm:p-8 text-center max-w-md w-full shadow-soft-lg backdrop-blur-sm">
          <p className="text-muted-foreground">{t('org.invalidInviteLink')}</p>
          <Link href="/login"><Button className="mt-4">{t('auth.backToSignIn')}</Button></Link>
        </div>
      </div>
    );
  }
  const result = await acceptInvite(token);
  if ((result as { error?: string }).error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="rounded-2xl border border-border/80 bg-card/95 p-6 sm:p-8 text-center max-w-md w-full shadow-soft-lg backdrop-blur-sm">
          <p className="text-destructive">{(result as { error: string }).error}</p>
          <Link href="/login"><Button className="mt-4">{t('auth.backToSignIn')}</Button></Link>
        </div>
      </div>
    );
  }
  redirect('/org');
}
