// backend/api/_rate-limit.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/**
 * Enterprise-grade rate limiter (serverless safe)
 *
 * @param {Object} params
 * @param {string} params.key - unique key (endpoint + ip)
 * @param {number} params.limit - max attempts
 * @param {number} params.window - window in seconds
 */
export async function rateLimit({ key, limit, window }) {
  const now = Date.now();
  const windowMs = window * 1000;
  const redisKey = `rl:${key}`;

  // Remove old entries
  await redis.zremrangebyscore(redisKey, 0, now - windowMs);

  // Count current
  const count = await redis.zcard(redisKey);

  if (count >= limit) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  // Add current attempt
  await redis.zadd(redisKey, {
    score: now,
    member: `${now}-${Math.random()}`,
  });

  // Ensure TTL
  await redis.expire(redisKey, window);

  return {
    allowed: true,
    remaining: limit - count - 1,
  };
}
