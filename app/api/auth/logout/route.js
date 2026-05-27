import { NextResponse } from 'next/server';
import { createSupabaseRouteClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(request) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit('logout', ip);
  if (!allowed) {
    return NextResponse.redirect(new URL('/login', siteUrl));
  }

  const response = NextResponse.redirect(new URL('/login', siteUrl));
  const supabase = createSupabaseRouteClient(request, response);
  await supabase.auth.signOut();
  return response;
}
