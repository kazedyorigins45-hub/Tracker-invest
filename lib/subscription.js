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

  const planCode = subscription?.plan_code || 'starter';
  const subStatus = subscription?.status || null;

  // Past-due or unpaid subscriptions lose feature access until payment resolves
  const paymentFailed = ['past_due', 'unpaid'].includes(subStatus);

  let trialExpired = false;
  if (planCode === 'starter' && user.created_at) {
    const createdAt = new Date(user.created_at);
    const daysSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    trialExpired = daysSince > 5;
  }

  return {
    user,
    subscription: subscription || null,
    planCode,
    trialExpired: trialExpired || paymentFailed,
    paymentFailed,
  };
}
