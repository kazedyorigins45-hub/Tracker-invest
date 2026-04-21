import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

async function resolvePlanCode(admin, subscription) {
  const metadataPlan = subscription?.metadata?.plan_code;
  if (metadataPlan) return metadataPlan;

  const priceId = subscription?.items?.data?.[0]?.price?.id;
  if (!priceId) return 'starter';

  const { data } = await admin
    .from('pricing_plans')
    .select('code, stripe_price_monthly_id, stripe_price_yearly_id')
    .or(`stripe_price_monthly_id.eq.${priceId},stripe_price_yearly_id.eq.${priceId}`)
    .maybeSingle();

  return data?.code || 'starter';
}

async function syncSubscription(admin, subscription, extra = {}) {
  if (!extra.user_id) return;
  const planCode = await resolvePlanCode(admin, subscription);
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  const billingCycle = extra.billing_cycle || (subscription?.metadata?.billing_cycle || 'monthly');

  await admin.from('user_subscriptions').upsert({
    user_id: extra.user_id,
    stripe_customer_id: String(subscription?.customer || extra.stripe_customer_id || ''),
    stripe_subscription_id: String(subscription?.id || extra.stripe_subscription_id || ''),
    plan_code: planCode,
    billing_cycle: billingCycle,
    status: subscription?.status || extra.status || 'active',
    current_period_end: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: !!subscription?.cancel_at_period_end,
    trial_end: subscription?.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    last_stripe_event_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (priceId) {
    await admin.from('stripe_webhook_events').upsert({
      id: `${subscription.id}:${priceId}`,
      type: 'subscription.sync',
      payload: { subscription_id: subscription.id, price_id: priceId },
      processed_at: new Date().toISOString(),
    });
  }
}

export async function POST(request) {
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe non configuré.' }, { status: 500 });
  }

  const stripe = getStripe();
  const admin = createServiceClient();
  const signature = request.headers.get('stripe-signature');
  const payload = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook invalide: ${error.message}` }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscription = session.subscription ? await stripe.subscriptions.retrieve(session.subscription) : null;
      if (subscription) {
        await syncSubscription(admin, subscription, {
          user_id: session.metadata?.user_id,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          billing_cycle: session.metadata?.billing_cycle,
          status: subscription.status,
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      await syncSubscription(admin, subscription, {
        user_id: subscription.metadata?.user_id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        billing_cycle: subscription.metadata?.billing_cycle,
        status: subscription.status,
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      if (!subscription.metadata?.user_id) return NextResponse.json({ received: true });
      await admin.from('user_subscriptions').upsert({
        user_id: subscription.metadata?.user_id,
        stripe_customer_id: String(subscription.customer || ''),
        stripe_subscription_id: String(subscription.id || ''),
        plan_code: 'starter',
        billing_cycle: subscription.metadata?.billing_cycle || 'monthly',
        status: 'canceled',
        cancel_at_period_end: true,
        last_stripe_event_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
