'use client';

import { useLocale } from '@/components/locale-provider';
import {
  LOCALES,
  LOCALE_NAMES,
  type Locale,
} from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useLocale();

  return (
    <Select
      value={locale}
      onValueChange={(v) => setLocale(v as Locale)}
      disabled={isPending}
    >
      <SelectTrigger className="w-[140px] h-9" aria-label="Language">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
