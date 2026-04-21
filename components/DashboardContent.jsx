"use client";

import Link from 'next/link';
import { useLocale } from '@/lib/locale';
import { getPlan } from '@/lib/plans';

export default function DashboardContent({ planCode = 'starter', subscription = null, userEmail = '' }) {
  const { t } = useLocale();
  const plan = getPlan(planCode);

  return (
    <>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2>{t('dashboard.active')}</h2>
        <div className="mini-grid">
          <div className="stat"><span className="muted">{t('app.plan')}</span><strong>{plan.name}</strong></div>
          <div className="stat"><span className="muted">{t('app.status')}</span><strong>{subscription?.status || 'active'}</strong></div>
          <div className="stat"><span className="muted">{t('app.cycle')}</span><strong>{subscription?.billing_cycle === 'yearly' ? 'Annuel' : 'Mensuel'}</strong></div>
          <div className="stat"><span className="muted">{t('dashboard.nextPayment')}</span><strong>{subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('fr-FR') : '—'}</strong></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2>{t('dashboard.subscription')}</h2>
        <p className="hint">{t('dashboard.subscriptionText')}</p>
        <div className="toolbar">
          <Link className="btn btn-gold" href="/billing">{t('dashboard.manage')}</Link>
          <Link className="btn btn-dark" href="/pricing">{t('dashboard.change')}</Link>
        </div>
      </div>
    </>
  );
}
