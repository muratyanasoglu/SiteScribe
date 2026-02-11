'use client';

import { useT } from '@/components/locale-provider';

export function ForgotPasswordTitle() {
  const t = useT();
  return <>{t('auth.forgotPasswordTitle')}</>;
}
