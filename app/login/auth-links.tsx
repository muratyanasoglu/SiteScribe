'use client';

import Link from 'next/link';
import { useT } from '@/components/locale-provider';

export function AuthLinksLogin() {
  const t = useT();
  return (
    <p className="text-center text-sm text-muted-foreground">
      {t('auth.noAccount')}{' '}
      <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-2">
        {t('auth.register')}
      </Link>
      {' · '}
      <Link href="/guide" className="text-primary font-semibold hover:underline underline-offset-2">
        {t('nav.guide')}
      </Link>
    </p>
  );
}

export function AuthLinksRegister() {
  const t = useT();
  return (
    <p className="text-center text-sm text-muted-foreground">
      {t('auth.alreadyHaveAccount')}{' '}
      <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-2">
        {t('auth.signIn')}
      </Link>
      {' · '}
      <Link href="/guide" className="text-primary font-semibold hover:underline underline-offset-2">
        {t('nav.guide')}
      </Link>
    </p>
  );
}
