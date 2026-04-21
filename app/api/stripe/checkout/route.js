import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const planCode = String(body.planCode || '').trim();
    const billingCycle = body.billingCycle === 'yearly' ? 'yearly' : 'monthly';

    if (!planCode) {
      return NextResponse.json({ ok: false, error: 'planCode manquant.' }, { status: 400 });
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

    if (planError) {
      return NextResponse.json({ ok: false, error: planError.message }, { status: 400 });
    }

    const priceId = billingCycle === 'yearly' ? planRow?.stripe_price_yearly_id : planRow?.stripe_price_monthly_id;
    if (!priceId) {
      return NextResponse.json({ ok: false, error: `Price Stripe manquant pour ${planCode} (${billingCycle}).` }, { status: 400 });
    }

    const { data: existingSubscription } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    let customerId = existingSubscription?.stripe_customer_id || '';

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: authData.user.email,
        metadata: {
          user_id: authData.user.id,
          plan_code: planCode,
        },
      });
      customerId = customer.id;

      await admin.from('user_subscriptions').upsert({
        user_id: authData.user.id,
        stripe_customer_id: customerId,
        plan_code: planCode,
        billing_cycle: billingCycle,
        status: 'active',
        updated_at: new Date().toISOString(),
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?checkout=success`,
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
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur Stripe.' }, { status: 500 });
  }
}
