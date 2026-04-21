"use client";

import { useLocale } from '@/lib/locale';

export default function LanguageToggle({ className = '' }) {
  const { locale, setLocale, t } = useLocale();

  const next = locale === 'fr' ? 'en' : 'fr';

  return (
    <button type="button" className={`theme-toggle ${className}`.trim()} onClick={() => setLocale(next)} aria-label="Basculer la langue">
      {locale === 'fr' ? t('language.english') : t('language.french')}
    </button>
  );
}
