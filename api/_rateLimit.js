"use strict";

/**
 * api/_rateLimit.js
 * CommonJS wrapper that dynamically imports the backend ESM rate limiter.
 * Required because Vercel may execute /api files as CJS.
 *
 * Optional debug:
 * - Set BE_DEBUG_RATE_LIMIT=1 to enable minimal runtime logs (no secrets).
 */

let cachedRateLimit = null;
let didSelfTest = false;

function debugEnabled() {
  return String(process.env.BE_DEBUG_RATE_LIMIT || "").trim() === "1";
}

function dlog(...args) {
  if (!debugEnabled()) return;
  // Keep logs minimal and consistent for Vercel runtime logs
  console.log("[RATE_LIMIT_DEBUG]", ...args);
}

function pickRateLimit(mod) {
  if (mod && typeof mod.rateLimit === "function") return mod.rateLimit;
  if (mod && mod.default && typeof mod.default.rateLimit === "function") return mod.default.rateLimit;
  return null;
}

async function selfTestRedisIfDebug() {
  if (!debugEnabled()) return;
  if (didSelfTest) return;
  didSelfTest = true;

  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  dlog("env", {
    UPSTASH_REDIS_REST_URL: hasUrl ? "present" : "missing",
    UPSTASH_REDIS_REST_TOKEN: hasToken ? "present" : "missing"
  });

  if (!hasUrl || !hasToken) {
    dlog("self-test skipped (missing env)");
    return;
  }

  try {
    const { Redis } = require("@upstash/redis");
    const redis = Redis.fromEnv();

    const key = `be:rl:debug:${Date.now()}`;
    await redis.set(key, "1", { ex: 60 });
    const v = await redis.get(key);

    dlog("self-test ok", { wrote: true, readBack: v === "1" || v === 1 });
  } catch (e) {
    dlog("self-test failed", { message: e && e.message ? e.message : String(e) });
  }
}

async function loadBackendRateLimit() {
  if (cachedRateLimit) return cachedRateLimit;

  await selfTestRedisIfDebug();

  // backend/package.json has "type": "module", so backend/api/_rateLimit.js is ESM.
  const mod = await import("../backend/api/_rateLimit.js");
  const fn = pickRateLimit(mod);

  if (!fn) {
    throw new Error(
      "RATE_LIMIT_IMPORT_FAILED: Expected named export `rateLimit` from ../backend/api/_rateLimit.js"
    );
  }

  cachedRateLimit = fn;
  dlog("backend rateLimit loaded");
  return cachedRateLimit;
}

async function rateLimit(opts) {
  const fn = await loadBackendRateLimit();

  try {
    const out = await fn(opts);
    if (debugEnabled()) {
      dlog("call", {
        key: opts && opts.key ? String(opts.key) : "(missing)",
        limit: opts && typeof opts.limit === "number" ? opts.limit : "(missing)",
        window: opts && typeof opts.window === "number" ? opts.window : "(missing)",
        allowed: out && out.allowed === true,
        remaining: out && typeof out.remaining === "number" ? out.remaining : "(n/a)"
      });
    }
    return out;
  } catch (e) {
    dlog("call failed", { message: e && e.message ? e.message : String(e) });
    throw e;
  }
}

module.exports = { rateLimit };
