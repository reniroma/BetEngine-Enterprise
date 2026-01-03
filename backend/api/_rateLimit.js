// backend/api/_rateLimit.js
"use strict";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RATE_LIMIT_LUA = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local windowMs = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])
  local ttl = tonumber(ARGV[4])
  local member = ARGV[5]

  redis.call("ZREMRANGEBYSCORE", key, 0, now - windowMs)

  local count = redis.call("ZCARD", key)
  if count >= limit then
    redis.call("EXPIRE", key, ttl)
    return {0, 0}
  end

  redis.call("ZADD", key, now, member)
  redis.call("EXPIRE", key, ttl)

  local remaining = limit - (count + 1)
  return {1, remaining}
`;

/**
 * Enterprise-grade rate limiter (serverless safe)
 *
 * @param {Object} params
 * @param {string} params.key - unique key (endpoint + ip)
 * @param {number} params.limit - max attempts
 * @param {number} params.window - window in seconds
 */
async function rateLimit({ key, limit, window }) {
  const now = Date.now();
  const windowMs = window * 1000;
  const redisKey = `rl:${key}`;

  const member = `${now}-${Math.random()}`;

  const result = await redis.eval(
    RATE_LIMIT_LUA,
    [redisKey],
    [String(now), String(windowMs), String(limit), String(window), member]
  );

  const allowed = Array.isArray(result) ? result[0] : 0;
  const remaining = Array.isArray(result) ? result[1] : 0;

  return {
    allowed: allowed === 1 || allowed === "1",
    remaining: typeof remaining === "number" ? remaining : Number(remaining) || 0
  };
}

module.exports = { rateLimit };
