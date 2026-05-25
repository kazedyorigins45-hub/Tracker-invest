import { createServiceClient, createSupabaseServerClient } from '@/lib/supabase/server';

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
