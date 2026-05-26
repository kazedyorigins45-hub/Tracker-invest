import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.error('[stripe/checkout] CRITICAL: NEXT_PUBLIC_SITE_URL is not set — Stripe redirects will point to localhost.');
}

const VALID_PLAN_CODES = ['trader', 'investor', 'empire'];

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const { allowed } = await checkRateLimit('checkout', ip);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: 'Trop de tentatives. Réessaie dans 1 minute.' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const planCode = String(body.planCode || '').trim();
    const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly';
    const termsAccepted = body.termsAccepted === true;

    if (!planCode || !VALID_PLAN_CODES.includes(planCode)) {
      return NextResponse.json({ ok: false, error: 'Plan invalide.' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ ok: false, error: 'Vous devez accepter les conditions générales.' }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ ok: false, error: 'Stripe non configuré.' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({
        ok: false,
        loginUrl: `/login?plan=${encodeURIComponent(planCode)}&billing=${encodeURIComponent(billingCycle)}&redirect=${encodeURIComponent(`/pricing?plan=${planCode}&billing=${billingCycle}`)}`,
      }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: planRow, error: planError } = await admin
      .from('pricing_plans')
      .select('*')
      .eq('code', planCode)
      .maybeSingle();

    if (planError || !planRow) {
      return NextResponse.json({ ok: false, error: 'Plan introuvable.' }, { status: 400 });
    }

    const priceId = billingCycle === 'yearly' ? planRow.stripe_price_yearly_id : planRow.stripe_price_monthly_id;
    if (!priceId) {
      return NextResponse.json({ ok: false, error: 'Configuration de prix manquante.' }, { status: 400 });
    }

    const { data: existingSub } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id || '';

    // If the user already has a live Stripe subscription, update it in place
    const hasActiveSub =
      existingSub?.stripe_subscription_id &&
      ['active', 'trialing', 'past_due'].includes(existingSub.status);

    if (hasActiveSub) {
      const stripeSubscription = await stripe.subscriptions.retrieve(existingSub.stripe_subscription_id);
      const currentItemId = stripeSubscription.items.data[0]?.id;
      const idempotencyKey = `update-${authData.user.id}-${planCode}-${billingCycle}`;

      await stripe.subscriptions.update(existingSub.stripe_subscription_id, {
        items: [{ id: currentItemId, price: priceId }],
        proration_behavior: 'create_prorations',
        metadata: {
          user_id: authData.user.id,
          plan_code: planCode,
          billing_cycle: billingCycle,
        },
      }, { idempotencyKey });

      // DB is updated exclusively by the webhook (customer.subscription.updated)
      return NextResponse.json({ ok: true, updated: true });
    }

    // No active subscription — create Stripe Customer if needed, then a Checkout Session
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: authData.user.email,
        metadata: { user_id: authData.user.id, plan_code: planCode },
      });
      customerId = customer.id;
    }

    // Save customer_id and preserve existing plan — webhook will upgrade plan_code after payment
    await admin.from('user_subscriptions').upsert({
      user_id: authData.user.id,
      stripe_customer_id: customerId,
      plan_code: existingSub?.plan_code || 'starter',
      billing_cycle: existingSub?.billing_cycle || 'monthly',
      status: existingSub?.status || 'incomplete',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: 'if_required',
      success_url: `${siteUrl}/billing?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          user_id: authData.user.id,
          plan_code: planCode,
          billing_cycle: billingCycle,
        },
      },
      metadata: {
        user_id: authData.user.id,
        plan_code: planCode,
        billing_cycle: billingCycle,
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    console.error('[stripe/checkout] Unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
