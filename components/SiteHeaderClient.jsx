"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import CurrencyToggle from '@/components/CurrencyToggle';
import LocaleToggle from '@/components/LocaleToggle';
import { useLocale } from '@/lib/locale';

export default function SiteHeaderClient({ user: serverUser, planCode: serverPlanCode, subscription: serverSubscription }) {
  const { t } = useLocale();
  const [user, setUser] = useState(serverUser);
  const [planCode, setPlanCode] = useState(serverPlanCode || 'starter');
  const [subscription, setSubscription] = useState(serverSubscription);

  // User/plan data is passed as server-rendered props — no client fetch needed

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="brand" href="/">
          Tracker-invest
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
            <LocaleToggle className="theme-toggle--header" />
            <ThemeToggle className="theme-toggle--header" />
            <CurrencyToggle className="theme-toggle--header" />
          </div>
        </nav>
      </div>
    </header>
  );
}
