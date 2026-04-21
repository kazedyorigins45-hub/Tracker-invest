import { createServiceClient, createSupabaseServerClient } from '@/lib/supabase/server';

export async function getSessionContext() {
  const supabase = createSupabaseServerClient();
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

  return {
    user,
    subscription: subscription || null,
    planCode: subscription?.plan_code || 'starter',
  };
}
