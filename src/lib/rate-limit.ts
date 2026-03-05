/**
 * In-memory per-key rate limiter. Use for single-instance deployments.
 * For multi-instance, use Redis or similar (not provided here).
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

const store = new Map<string, { count: number; resetAt: number }>();

function now(): number {
  return Date.now();
}

/**
 * Returns true if the key is within limit (request allowed), false if over limit (should reject).
 * Call this at the start of the request; it increments the counter for the key.
 */
export function checkRateLimit(key: string): boolean {
  const n = now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: n + WINDOW_MS });
    return true;
  }

  if (n >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: n + WINDOW_MS });
    return true;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  return true;
}

/**
 * Get client identifier from request (e.g. for rate limiting by IP).
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
