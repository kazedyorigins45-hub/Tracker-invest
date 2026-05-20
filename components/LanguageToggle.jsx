"use client";

import { useLocale } from '@/lib/locale';

export default function LanguageToggle({ className = '' }) {
  const { locale, setLocale } = useLocale();
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      aria-label="Changer de langue"
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
