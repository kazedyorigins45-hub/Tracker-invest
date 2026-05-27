"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPageView({ planCode = 'starter', subscription = null, userEmail = '' }) {
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const portalMissing = searchParams.get('portal') === 'missing';

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-top">
            <div className="tag">Dashboard</div>
            <Link href="/dashboard" className="brand-link"><h1>Tracker-invest</h1></Link>
            <p>{t('dashboard.subtitle')}</p>
          </div>

          <nav className="sidebar-apps" aria-label="Navigation site">
            <div className="sidebar-apps-label">{t('mindset.spaces')}</div>
            <Link href="/dashboard" className="app-link is-current">{t('app.dashboardLink')}</Link>
            <Link href="/mindset" className="app-link">{t('app.mindset')}</Link>
            {canAccess(planCode, 'tracker') ? <Link href="/tracker" className="app-link">{t('app.trading')}</Link> : null}
            {canAccess(planCode, 'invest') ? <Link href="/invest" className="app-link">{t('app.invest')}</Link> : null}
            {canAccess(planCode, 'portfolio') ? <Link href="/portfolio" className="app-link">{t('app.portfolio')}</Link> : null}
          </nav>
        </div>

        <div className="sidebar-inner">
          <button type="button" className="nav-item" onClick={() => router.push('/mindset')}>{t('mindset.home')}</button>
          <button type="button" className="nav-item" onClick={() => router.push('/mindset#page-vision')}>{t('mindset.vision')}</button>
          <button type="button" className="nav-item" onClick={() => router.push('/mindset#page-journal')}>{t('mindset.journal')}</button>
          <button type="button" className="nav-item" onClick={() => router.push('/mindset#page-routine')}>{t('mindset.routine')}</button>
          <button type="button" className="nav-item" onClick={() => router.push('/mindset#page-rules')}>{t('mindset.rules')}</button>
        </div>

        <div className="sidebar-bottom">
          <p className="app-plan">{t('app.subscription')} : {subscriptionLabel}</p>
          <span id="auth-user-email" style={{ wordBreak: 'break-all' }}>{userEmail}</span>
          {planCode !== 'starter' && !portalMissing ? (
            <form method="post" action="/api/stripe/portal" style={{ display: 'inline' }}>
              <button type="submit" className="sidebar-portal">{t('dashboard.manage')}</button>
            </form>
          ) : null}
          {portalMissing ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0' }}>{t('dashboard.portalMissing')}</p>
          ) : null}
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sidebar-logout">{t('site.logout')}</button>
          </form>
        </div>
      </aside>

      <main id="main-content" className="main">
        <DashboardContent planCode={planCode} subscription={subscription} userEmail={userEmail} />
      </main>
    </div>
  );
}
