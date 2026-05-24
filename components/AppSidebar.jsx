"use client";

import Link from 'next/link';
import { APP_NAV, canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useLocale } from '@/lib/locale';

export default function AppSidebar({ planCode = 'starter', subscription = null, current = '/dashboard' }) {
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const canUpgrade = planCode !== 'empire';
  const { t } = useLocale();

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-top">
        <Link className="brand brand-dark" href="/dashboard">
          Tracker-invest
        </Link>
        <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
        {subscription?.status ? <p className="app-subscription-status">{t('app.status')} : {subscription.status}</p> : null}
      </div>

      <nav className="app-nav">
        {APP_NAV.filter((item) => canAccess(planCode, item.feature)).map((item) => (
          <Link key={item.href} href={item.href} className={current === item.href ? 'active' : ''}>
            {item.feature === 'mindset' ? t('app.mindset') : item.feature === 'tracker' ? t('app.trading') : item.feature === 'invest' ? t('app.invest') : t('app.portfolio')}
          </Link>
        ))}
      </nav>

      {canUpgrade ? (
        <div className="app-upgrade">
          <p>{t('app.upgrade')}</p>
          <Link href="/pricing" className="btn btn-gold">
            {t('app.upgrade')}
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
