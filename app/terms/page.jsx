"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';

export default function TermsPage() {
  const { t } = useLocale();

  return (
    <main>
      <div className="user-strip">
        <span className="brand">Mindset Invest</span>
        <nav className="footer-links" aria-label="Navigation rapide">
          <Link href="/">{t('site.home')}</Link>
          <Link href="/pricing">{t('site.subscriptions')}</Link>
          <Link href="/login">{t('site.login')}</Link>
        </nav>
      </div>
      <div className="home-wrap">
        <h1 className="home-title">{t('legal.termsTitle')}</h1>
        <p className="tagline">{t('legal.placeholder')}</p>
      </div>
    </main>
  );
}
