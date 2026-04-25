"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { canAccess, getSubscriptionLabel } from '@/lib/plans';
import { useLocale } from '@/lib/locale';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPageView({ planCode = 'starter', subscription = null, userEmail = '' }) {
  const subscriptionLabel = getSubscriptionLabel(subscription, planCode);
  const { t } = useLocale();
  const router = useRouter();

  return (
    <div className="mindset-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-top">
            <div className="tag">Dashboard</div>
            <Link href="/dashboard" className="brand-link"><h1>Mindset Invest</h1></Link>
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
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="sidebar-logout">{t('site.logout')}</button>
          </form>
        </div>
      </aside>

      <main className="main">
        <DashboardContent planCode={planCode} subscription={subscription} userEmail={userEmail} />
      </main>
    </div>
  );
}
