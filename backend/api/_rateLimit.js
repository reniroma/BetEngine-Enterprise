// backend/api/_rateLimit.js
import { Redis } from "@upstash/redis";

let redisClient = null;

function assertRedisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const missing = [
      !url ? "UPSTASH_REDIS_REST_URL" : null,
      !token ? "UPSTASH_REDIS_REST_TOKEN" : null,
    ].filter(Boolean);

    const err = new Error(
      `REDIS_NOT_CONFIGURED: Missing env vars: ${missing.join(", ")}`
    );
    err.code = "REDIS_NOT_CONFIGURED";
    throw err;
  }

  return { url, token };
}

function createRedisClient(url, token) {
  // Some @upstash/redis versions may not accept allowTelemetry.
  // We try the strict config first, then fallback to minimal config.
  try {
    return new Redis({ url, token, allowTelemetry: false });
  } catch {
    return new Redis({ url, token });
  }
}

function getRedis() {
  if (redisClient) return redisClient;

  const { url, token } = assertRedisEnv();
  redisClient = createRedisClient(url, token);
  return redisClient;
}

/**
 * rateLimit({ key, limit, window })
 * - key: string (e.g. "auth:login:1.2.3.4")
 * - limit: number (max attempts)
 * - window: number (seconds)
 *
 * Returns:
 * { allowed: boolean, remaining: number, limit: number, reset: number|null }
 *
 * reset = TTL in seconds (approx), null on fail-open
 */
export async function rateLimit({ key, limit, window }) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 1;
  const safeWindow = Number.isFinite(window)
    ? Math.max(1, Math.floor(window))
    : 60;

  if (!key || typeof key !== "string") {
    // Invalid input should never hard-fail auth
    return { allowed: true, remaining: safeLimit, limit: safeLimit, reset: null };
  }

  try {
    const redis = getRedis();
    const redisKey = `rl:${key}`;

    // Increment counter
    const count = await redis.incr(redisKey);

    // Ensure TTL exists (set on first hit; repair if missing)
    if (count === 1) {
      await redis.expire(redisKey, safeWindow);
    } else {
      const ttl = await redis.ttl(redisKey);
      if (ttl === -1) {
        await redis.expire(redisKey, safeWindow);
      }
    }

    const allowed = count <= safeLimit;
    const remaining = Math.max(0, safeLimit - count);

    // TTL: -2 means key does not exist, -1 means no expire
    const ttlNow = await redis.ttl(redisKey);
    const reset = ttlNow >= 0 ? ttlNow : null;

    return { allowed, remaining, limit: safeLimit, reset };
  } catch {
    // Fail-open: never block auth if Redis is down/misconfigured
    return { allowed: true, remaining: safeLimit, limit: safeLimit, reset: null };
  }
}

export default { rateLimit };
