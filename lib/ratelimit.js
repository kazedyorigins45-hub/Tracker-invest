const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
