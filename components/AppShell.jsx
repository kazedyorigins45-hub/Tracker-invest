"use client";

import AppSidebar from '@/components/AppSidebar';
import Link from 'next/link';
import { getSubscriptionLabel } from '@/lib/plans';
import LogoMark from '@/components/LogoMark';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { useLocale } from '@/lib/locale';

export default function AppShell({ planCode, subscription, current, title, subtitle, userEmail, children }) {
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();
  const resolvedTitle = title === 'Dashboard' ? t('dashboard.title') : title;
  const resolvedSubtitle = subtitle === 'Vue d’ensemble de ton espace premium.' ? t('dashboard.subtitle') : subtitle;

  return (
    <div className="app-layout">
      <AppSidebar planCode={planCode} subscription={subscription} current={current} />
      <main className="app-main">
        <div className="app-topbar">
          <div>
            <h1>{resolvedTitle}</h1>
            {resolvedSubtitle ? <p>{resolvedSubtitle}</p> : null}
          </div>
          <div className="app-userbox">
            <span className="app-subscription-badge">{subscriptionLabel}</span>
            <span>{userEmail}</span>
            <div className="app-topbar-controls">
              <LogoMark />
              <ThemeToggle className="theme-toggle--app" />
              <LanguageToggle className="theme-toggle--app" />
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-dark" type="submit">{t('app.logout')}</button>
            </form>
          </div>
        </div>
        {children}
        <div className="app-backlink">
          <Link href="/pricing">{t('app.seePlans')}</Link>
        </div>
      </main>
    </div>
  );
}
