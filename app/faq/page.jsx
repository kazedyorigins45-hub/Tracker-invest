"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import SiteFooter from '@/components/SiteFooter';

export default function FaqPage() {
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
        <h1 className="home-title">FAQ</h1>
        <div className="pillars" aria-hidden="true">
          <div className="pillar"><strong>Stripe</strong>La structure est prête, l’intégration peut se brancher ensuite.</div>
          <div className="pillar"><strong>Sécurité</strong>Routes protégées et auth Supabase côté serveur.</div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
