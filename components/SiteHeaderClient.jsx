"use client";

import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLocale } from '@/lib/locale';

export default function SiteHeaderClient({ user, planCode, subscription }) {
  const { t } = useLocale();

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="brand" href="/">
          Mindset Invest
        </Link>
        <nav className="nav">
          <Link href="/pricing">{t('site.subscriptions')}</Link>
          <Link href="/features">{t('site.features')}</Link>
          <Link href="/faq">{t('site.faq')}</Link>
          {user ? (
            <details className="profile-menu">
              <summary className="profile-trigger" aria-label="Menu profil">
                <span className="profile-avatar">👤</span>
                <span className="profile-status">{planCode?.toUpperCase?.() || 'MEMBER'}</span>
              </summary>
              <div className="profile-dropdown">
                <div className="profile-meta">
                  <strong>{user.email}</strong>
                  <span>{subscription?.billing_cycle === 'yearly' ? t('pricing.yearly') : t('pricing.monthly')}</span>
                </div>
                <Link href="/dashboard">{t('site.mySpace')}</Link>
                <form action="/api/auth/logout" method="post" className="nav-form">
                  <button type="submit" className="nav-button">{t('site.logout')}</button>
                </form>
              </div>
            </details>
          ) : (
            <Link href="/login">{t('site.login')}</Link>
          )}
          <div className="site-header-controls">
            <LogoMark />
            <ThemeToggle className="theme-toggle--header" />
            <LanguageToggle className="theme-toggle--header" />
          </div>
        </nav>
      </div>
    </header>
  );
}
