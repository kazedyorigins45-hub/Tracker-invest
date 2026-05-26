import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function POST(request) {
  return runSync(request);
}

async function runSync(request) {
  try {
    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ ok: true, synced: false }, { headers: response.headers });

    const admin = createServiceClient();
    const { data: row } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!row?.stripe_customer_id) {
      return NextResponse.json({ ok: true, synced: false }, { headers: response.headers });
    }

    // If we already have a subscription ID, sync it directly
    if (row.stripe_subscription_id) {
      const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
      await syncFromStripe(admin, authData.user.id, row.stripe_customer_id, sub);
      return NextResponse.json({ ok: true, synced: true }, { headers: response.headers });
    }

    // No subscription ID — find the latest active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: row.stripe_customer_id,
      status: 'all',
      limit: 5,
    });

    const activeSub = subscriptions.data.find((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    );

    if (!activeSub) {
      return NextResponse.json({ ok: true, synced: false }, { headers: response.headers });
    }

    await syncFromStripe(admin, authData.user.id, row.stripe_customer_id, activeSub);
    return NextResponse.json({ ok: true, synced: true }, { headers: response.headers });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur serveur.' }, { status: 500 });
  }
}

async function syncFromStripe(admin, userId, customerId, subscription) {
  const priceId = subscription?.items?.data?.[0]?.price?.id;

  let planCode = subscription?.metadata?.plan_code || null;
  if (!planCode && priceId) {
    const { data } = await admin
      .from('pricing_plans')
      .select('code')
      .or(`stripe_price_monthly_id.eq.${priceId},stripe_price_yearly_id.eq.${priceId}`)
      .maybeSingle();
    planCode = data?.code || 'starter';
  }
  if (!planCode) planCode = 'starter';

  const billingCycle = subscription?.metadata?.billing_cycle || 'monthly';

  const { error: upsertError } = await admin.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: String(customerId),
    stripe_subscription_id: String(subscription.id),
    plan_code: planCode,
    billing_cycle: billingCycle,
    status: subscription.status,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: !!subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (upsertError) throw new Error(`DB sync failed: ${upsertError.message}`);
}
