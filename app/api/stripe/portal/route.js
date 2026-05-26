import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function GET(request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ ok: false, error: 'Stripe non configuré.' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.redirect(new URL('/login?redirect=/dashboard', siteUrl));
    }

    const admin = createServiceClient();
    const { data: subscription } = await admin
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/dashboard?portal=missing', siteUrl));
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/dashboard`,
    });

    return NextResponse.redirect(portal.url);
  } catch (error) {
    console.error('[stripe/portal] Unexpected error:', error?.message);
    return NextResponse.json({ ok: false, error: 'Erreur serveur.' }, { status: 500 });
  }
}
