"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';

export default function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>Mindset Invest</strong>
          <p>Une suite premium pour la discipline, le trading et l’investissement.</p>
        </div>
        <div className="footer-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/terms">CGU</Link>
          <Link href="/privacy">Confidentialité</Link>
          <Link href="/login">{t('site.login')}</Link>
        </div>
      </div>
    </footer>
  );
}
