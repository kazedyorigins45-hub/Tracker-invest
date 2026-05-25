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

async function resolveUserId(admin, subscription) {
  if (subscription?.metadata?.user_id) return subscription.metadata.user_id;

  const customerId = String(subscription?.customer || '');
  if (!customerId) return null;

  const { data } = await admin
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  return data?.user_id || null;
}

async function syncSubscription(admin, subscription, extra = {}) {
  const userId = extra.user_id || (await resolveUserId(admin, subscription));
  if (!userId) return;

  const planCode = await resolvePlanCode(admin, subscription);
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  const billingCycle = extra.billing_cycle || subscription?.metadata?.billing_cycle || 'monthly';

  await admin.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: String(subscription?.customer || extra.stripe_customer_id || ''),
    stripe_subscription_id: String(subscription?.id || extra.stripe_subscription_id || ''),
    plan_code: planCode,
    billing_cycle: billingCycle,
    status: subscription?.status || extra.status || 'active',
    current_period_end: subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: !!subscription?.cancel_at_period_end,
    trial_end: subscription?.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    last_stripe_event_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (priceId) {
    try {
      await admin.from('stripe_webhook_events').upsert({
        id: `${subscription.id}:${priceId}`,
        type: 'subscription.sync',
        payload: { subscription_id: subscription.id, price_id: priceId },
        processed_at: new Date().toISOString(),
      });
    } catch {}
  }
}

async function markEventProcessed(admin, eventId, eventType) {
  try {
    await admin.from('stripe_webhook_events').upsert({
      id: eventId,
      type: eventType,
      payload: {},
      processed_at: new Date().toISOString(),
    });
  } catch {}
}

async function isEventAlreadyProcessed(admin, eventId) {
  const { data } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();
  return !!data;
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

  // Idempotence: skip events already processed
  if (await isEventAlreadyProcessed(admin, event.id)) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const subscription = session.subscription
        ? await stripe.subscriptions.retrieve(session.subscription)
        : null;
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

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created'
    ) {
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
      const userId = await resolveUserId(admin, subscription);
      if (!userId) return NextResponse.json({ received: true });

      await admin.from('user_subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: String(subscription.customer || ''),
        stripe_subscription_id: String(subscription.id || ''),
        plan_code: 'starter',
        billing_cycle: subscription.metadata?.billing_cycle || 'monthly',
        status: 'canceled',
        cancel_at_period_end: false,
        last_stripe_event_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) return NextResponse.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscription(admin, subscription, {
        user_id: subscription.metadata?.user_id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        billing_cycle: subscription.metadata?.billing_cycle,
        status: 'active',
      });
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) return NextResponse.json({ received: true });

      // Retrieve current subscription status from Stripe before marking past_due.
      // During checkout, Stripe may fire invoice.payment_failed for an initial attempt
      // that immediately retries and succeeds — in that case the subscription is already
      // active and we must not overwrite it with past_due.
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (stripeSubscription.status !== 'past_due' && stripeSubscription.status !== 'unpaid') {
        return NextResponse.json({ received: true });
      }

      const customerId = String(invoice.customer || '');
      const { data: row } = await admin
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (row?.user_id) {
        await admin
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            last_stripe_event_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', row.user_id);
      }
    }

    await markEventProcessed(admin, event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
