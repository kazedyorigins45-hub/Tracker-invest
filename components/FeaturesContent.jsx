"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';

export default function FeaturesContent() {
  const { t } = useLocale();

  return (
    <div className="home-wrap">
      <h1 className="home-title">{t('site.features').toUpperCase()}</h1>
      <div className="pillars" aria-hidden="true">
        <div className="pillar"><strong>{t('app.mindset')}</strong>{t('mindset.vision')}.</div>
        <div className="pillar"><strong>Elite Tracker</strong>{t('mindset.journal')}.</div>
      </div>
      <div className="pillar"><strong>Elite Invest</strong>{t('app.portfolio')}.</div>
      <footer className="note">Le design reste sobre, premium et centré sur l’essentiel.</footer>
    </div>
  );
}
