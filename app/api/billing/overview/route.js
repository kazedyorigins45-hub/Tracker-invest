import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit('billing', ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Réessaie dans 1 minute.' }, { status: 429 });
    }
    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const admin = createServiceClient();
    let { data: subscription } = await admin.from('user_subscriptions').select('*').eq('user_id', authData.user.id).maybeSingle();

    const stripe = getStripe();

    // Auto-sync from Stripe if webhook was missed (customer exists but no subscription ID yet)
    if (stripe && subscription?.stripe_customer_id && !subscription?.stripe_subscription_id) {
      try {
        const list = await stripe.subscriptions.list({
          customer: subscription.stripe_customer_id,
          status: 'all',
          limit: 5,
        });
        const activeSub = list.data.find((s) =>
          ['active', 'trialing', 'past_due'].includes(s.status)
        );

        if (activeSub) {
          const priceId = activeSub.items?.data?.[0]?.price?.id;
          let planCode = activeSub.metadata?.plan_code || null;
          if (!planCode && priceId) {
            const { data: planRow } = await admin
              .from('pricing_plans')
              .select('code')
              .or(`stripe_price_monthly_id.eq.${priceId},stripe_price_yearly_id.eq.${priceId}`)
              .maybeSingle();
            planCode = planRow?.code || 'starter';
          }

          const updates = {
            stripe_subscription_id: activeSub.id,
            plan_code: planCode || 'starter',
            billing_cycle: activeSub.metadata?.billing_cycle || 'monthly',
            status: activeSub.status,
            current_period_end: activeSub.current_period_end
              ? new Date(activeSub.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: !!activeSub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          };

          await admin.from('user_subscriptions').update(updates).eq('user_id', authData.user.id);
          subscription = { ...subscription, ...updates };
        }
      } catch (syncErr) {
        console.error('[billing/overview] Auto-sync failed:', syncErr?.message);
      }
    }

    const { data: plan } = subscription?.plan_code
      ? await admin.from('pricing_plans').select('*').eq('code', subscription.plan_code).maybeSingle()
      : { data: null };

    let invoices = [];
    let paymentMethods = [];

    if (stripe && subscription?.stripe_customer_id) {
      const [invoiceList, pmList] = await Promise.all([
        stripe.invoices.list({ customer: subscription.stripe_customer_id, limit: 5 }),
        stripe.customers.listPaymentMethods(subscription.stripe_customer_id, { type: 'card', limit: 5 }),
      ]);

      invoices = invoiceList.data.map((invoice) => ({
        id: invoice.id,
        status: invoice.status,
        total: invoice.total != null ? invoice.total / 100 : null,
        amount_paid: invoice.amount_paid != null ? invoice.amount_paid / 100 : null,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
        created: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
      }));

      paymentMethods = pmList.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        exp_month: pm.card?.exp_month,
        exp_year: pm.card?.exp_year,
      }));
    }

    return NextResponse.json({
      ok: true,
      subscription: subscription || null,
      plan: plan || null,
      invoices,
      paymentMethods,
    }, { headers: response.headers });
  } catch (error) {
    console.error('[billing/overview] Unexpected error:', error?.message);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
