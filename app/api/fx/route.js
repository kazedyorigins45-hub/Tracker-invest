import { NextResponse } from 'next/server';

const FALLBACK_EUR_USD = 1.08;
let cache = { rate: FALLBACK_EUR_USD, fetchedAt: 0 };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function GET() {
  const now = Date.now();
  if (now - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ rate: cache.rate, source: 'cache' });
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.USD;
    if (!rate || typeof rate !== 'number') throw new Error('Invalid rate');
    cache = { rate, fetchedAt: now };
    return NextResponse.json({ rate, source: 'live' }, {
      headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ rate: FALLBACK_EUR_USD, source: 'fallback' });
  }
}
