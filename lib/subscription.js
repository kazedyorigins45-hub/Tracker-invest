import Stripe from 'stripe';
import { createServiceClient, createSupabaseServerClient } from '@/lib/supabase/server';

async function syncMissingSubscription(admin, userId, stripeCustomerId) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return null;

  try {
    const stripe = new Stripe(stripeSecret);
    const list = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 5,
    });

    const activeSub = list.data.find((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    ) || list.data[0];

    if (!activeSub) return null;

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

    await admin.from('user_subscriptions').update(updates).eq('user_id', userId);
    return updates;
  } catch {
    return null;
  }
}

export async function getSessionContext() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user || null;

  if (!user) {
    return { user: null, subscription: null, planCode: 'starter' };
  }

  let subscription = null;

  try {
    const admin = createServiceClient();
    const { data } = await admin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    subscription = data || null;

    // If webhook was missed: sync from Stripe on the spot
    if (subscription?.stripe_customer_id && !subscription?.stripe_subscription_id) {
      const updates = await syncMissingSubscription(admin, user.id, subscription.stripe_customer_id);
      if (updates) subscription = { ...subscription, ...updates };
    }
  } catch {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    subscription = data || null;
  }

  const subStatus = subscription?.status || null;

  // Only grant the subscribed plan when Stripe confirms the subscription is live.
  // 'incomplete', 'canceled', or no subscription → fall back to 'starter'.
  const isActive = ['active', 'trialing'].includes(subStatus);
  const planCode = isActive ? (subscription?.plan_code || 'starter') : 'starter';

  // Past-due or unpaid: payment is overdue — block access until resolved.
  const paymentFailed = ['past_due', 'unpaid'].includes(subStatus);

  return {
    user,
    subscription: subscription || null,
    planCode,
    trialExpired: paymentFailed,
    paymentFailed,
  };
}
