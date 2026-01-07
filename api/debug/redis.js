"use strict";

/**
 * GET /api/debug/redis
 *
 * Purpose:
 * - Verify Upstash Redis connectivity from Vercel runtime
 * - Return strict JSON (never crash)
 * - Works even if project is CJS and @upstash/redis is ESM (uses dynamic import)
 *
 * Requires ENV:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(payload));
}

function safeStr(v) {
  return typeof v === "string" ? v : "";
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET");
      return res.end();
    }

    const url = safeStr(process.env.UPSTASH_REDIS_REST_URL).trim();
    const token = safeStr(process.env.UPSTASH_REDIS_REST_TOKEN).trim();

    const missing = [];
    if (!url) missing.push("UPSTASH_REDIS_REST_URL");
    if (!token) missing.push("UPSTASH_REDIS_REST_TOKEN");

    if (missing.length) {
      return sendJson(res, 500, {
        ok: false,
        error: "REDIS_NOT_CONFIGURED",
        message: `Missing env vars: ${missing.join(", ")}`,
        env: {
          hasUrl: Boolean(url),
          hasToken: Boolean(token),
          tokenLength: token ? token.length : 0
        }
      });
    }

    // Dynamic import to avoid ESM/CJS issues
    const mod = await import("@upstash/redis");
    const Redis = mod && mod.Redis ? mod.Redis : null;

    if (!Redis || typeof Redis.fromEnv !== "function") {
      return sendJson(res, 500, {
        ok: false,
        error: "REDIS_SDK_LOAD_FAILED",
        message: "Failed to load @upstash/redis Redis.fromEnv()"
      });
    }

    const redis = Redis.fromEnv();

    const key = `debug:redis:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    const value = "1";

    const setRes = await redis.set(key, value, { ex: 60 });
    const getRes = await redis.get(key);

    const ok = String(getRes) === value;

    return sendJson(res, ok ? 200 : 502, {
      ok,
      sdk: "@upstash/redis",
      test: {
        key,
        setResult: setRes ?? null,
        getResult: getRes ?? null,
        ttlSeconds: 60
      },
      env: {
        hasUrl: true,
        hasToken: true,
        tokenLength: token.length
      }
    });
  } catch (e) {
    return sendJson(res, 500, {
      ok: false,
      error: "REDIS_CONNECTION_FAILED",
      message: e && e.message ? e.message : String(e),
      name: e && e.name ? e.name : null,
      code: e && e.code ? e.code : null
    });
  }
};
