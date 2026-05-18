"use client";

import { useLocale } from '@/lib/locale';

export default function CurrencyToggle({ className = '' }) {
  const { locale, setLocale } = useLocale();

  const next = locale === 'fr' ? 'en' : 'fr';

  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={() => setLocale(next)} aria-label="Basculer la devise">
      {locale === 'fr' ? '$' : '€'}
    </button>
  );
}
