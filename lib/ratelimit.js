const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (process.env.NODE_ENV === 'production' && (!UPSTASH_URL || !UPSTASH_TOKEN)) {
  console.error('[ratelimit] CRITICAL: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set — rate limiting is DISABLED in production.');
}

async function buildLimiter(prefix, maxRequests, windowSeconds) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const { Ratelimit } = await import('@upstash/ratelimit');
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      prefix,
    });
  } catch {
    return null;
  }
}

export async function checkRateLimit(type, ip) {
  const identifier = ip || 'unknown';

  let limiter = null;
  if (type === 'login') {
    limiter = await buildLimiter('rl:login', 10, 60);
  } else if (type === 'register') {
    limiter = await buildLimiter('rl:register', 5, 60);
  } else if (type === 'reset') {
    limiter = await buildLimiter('rl:reset', 3, 300);
  } else if (type === 'billing') {
    limiter = await buildLimiter('rl:billing', 10, 60);
  } else if (type === 'checkout') {
    limiter = await buildLimiter('rl:checkout', 5, 60);
  } else if (type === 'storage') {
    limiter = await buildLimiter('rl:storage', 30, 60);
  } else if (type === 'logout') {
    limiter = await buildLimiter('rl:logout', 20, 60);
  }

  if (!limiter) return { allowed: true };

  const result = await limiter.limit(identifier);
  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getClientIp(request) {
  // Use Vercel's trusted header first (cannot be spoofed by clients)
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) return vercelIp.split(',')[0].trim();

  // Cloudflare trusted header
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // Fallback: take the LAST (rightmost) entry in X-Forwarded-For
  // which is the closest trusted proxy, not the client-controlled first entry
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',');
    return parts[parts.length - 1].trim();
  }

  return request.headers.get('x-real-ip') || 'unknown';
}
