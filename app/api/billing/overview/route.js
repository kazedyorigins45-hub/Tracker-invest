import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createServiceClient, createSupabaseRouteClient } from '@/lib/supabase/server';

const stripeSecret = process.env.STRIPE_SECRET_KEY;

function getStripe() {
  if (!stripeSecret) return null;
  return new Stripe(stripeSecret);
}

export async function GET(request) {
  try {
    const response = NextResponse.json({ ok: false });
    const supabase = createSupabaseRouteClient(request, response);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: subscription } = await admin.from('user_subscriptions').select('*').eq('user_id', authData.user.id).maybeSingle();
    const { data: plan } = subscription?.plan_code
      ? await admin.from('pricing_plans').select('*').eq('code', subscription.plan_code).maybeSingle()
      : { data: null };

    const stripe = getStripe();
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
        total: invoice.total,
        amount_paid: invoice.amount_paid,
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
    return NextResponse.json({ ok: false, error: error?.message || 'Erreur serveur.' }, { status: 500 });
  }
}
