"use client";

import { useLocale } from '@/lib/locale';

export default function LocaleToggle({ className = '' }) {
  const { locale, setLocale, t } = useLocale();

  function toggle() {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  }

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggle}
      aria-label={locale === 'fr' ? t('language.english') : t('language.french')}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
