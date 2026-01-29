// api/payments/bank-webhook.js
/*********************************************************
 * BetEngine Enterprise – BANK WEBHOOK (HMAC + IDEMPOTENCY)
 * POST /api/payments/bank-webhook
 *
 * Security:
 * 1) Verify HMAC signature against RAW body (timing-safe)
 * 2) Redis idempotency (SET NX + TTL) using Upstash Redis REST
 *
 * IMPORTANT:
 * - Requires BANK_WEBHOOK_SECRET in Vercel ENV
 * - Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for idempotency
 * - By default expects signature header: "x-webhook-signature"
 * - By default expects transaction id field: "transactionId"
 *********************************************************/

import { createHmac, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";

const DEFAULT_SIG_HEADER = "x-webhook-signature";
const DEFAULT_ID_FIELD = "transactionId";
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24h
const RAW_BODY_LIMIT_BYTES = 1024 * 1024; // 1MB

let redisClient = null;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getHeaderValue(req, headerName) {
  if (!headerName) return "";
  const key = String(headerName).toLowerCase();
  const v = req.headers[key];
  if (Array.isArray(v)) return v[0] || "";
  return typeof v === "string" ? v : "";
}

function normalizeSignature(input) {
  // Accept common formats:
  // - "sha256=<hex>"
  // - "<hex>"
  // - "<base64>"
  const s = (input || "").trim();
  if (!s) return "";
  const parts = s.split("=");
  if (parts.length === 2 && parts[0].toLowerCase().includes("sha256")) {
    return parts[1].trim();
  }
  return s;
}

function isHex(str) {
  return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
}

function base64ToBufferSafe(s) {
  try {
    return Buffer.from(s, "base64");
  } catch {
    return null;
  }
}

function hexToBufferSafe(s) {
  try {
    return Buffer.from(s, "hex");
  } catch {
    return null;
  }
}

function timingSafeEqualBuffers(a, b) {
  if (!a || !b) return false;
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) return false;
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function computeHmac(secret, rawBodyBuffer) {
  // Returns both hex and base64 buffers for flexible comparison
  const h = createHmac("sha256", secret);
  h.update(rawBodyBuffer);
  const digest = h.digest(); // Buffer
  return {
    raw: digest,
    hex: Buffer.from(digest.toString("hex"), "utf8"),
    b64: Buffer.from(digest.toString("base64"), "utf8"),
  };
}

async function readRawBody(req, limitBytes = RAW_BODY_LIMIT_BYTES) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limitBytes) return { ok: false, error: "BODY_TOO_LARGE" };
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks);
  return { ok: true, raw };
}

function assertRedisEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const missing = [
      !url ? "UPSTASH_REDIS_REST_URL" : null,
      !token ? "UPSTASH_REDIS_REST_TOKEN" : null,
    ].filter(Boolean);

    const err = new Error(`REDIS_NOT_CONFIGURED: Missing env vars: ${missing.join(", ")}`);
    err.code = "REDIS_NOT_CONFIGURED";
    throw err;
  }

  return { url, token };
}

function createRedisClient(url, token) {
  // Same robustness pattern as backend/api/_rateLimit.js
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

async function acquireIdempotencyLock(eventId) {
  // Returns:
  // - { ok:true, isNew:true }  => proceed
  // - { ok:true, isNew:false } => duplicate
  // - { ok:false, error:"..." } => redis not configured / redis failure
  try {
    const redis = getRedis();
    const key = `pay:bank:${eventId}`;

    // Prefer atomic SET with NX + EX
    // @upstash/redis supports: redis.set(key, value, { nx: true, ex: seconds })
    const res = await redis.set(key, "1", { nx: true, ex: IDEMPOTENCY_TTL_SECONDS });

    // Upstash returns "OK" on success, null on no-op (key exists)
    const isNew = res === "OK";
    return { ok: true, isNew };
  } catch (e) {
    return { ok: false, error: e && e.code ? String(e.code) : "REDIS_ERROR" };
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      return res.end();
    }

    // 1) Required secret (fail-closed)
    const secret = (process.env.BANK_WEBHOOK_SECRET || "").trim();
    if (!secret) {
      return sendJson(res, 501, {
        ok: false,
        error: { code: "WEBHOOK_NOT_CONFIGURED", message: "BANK_WEBHOOK_SECRET is missing." },
      });
    }

    // 2) Read RAW body (required for HMAC)
    const rawRead = await readRawBody(req);
    if (!rawRead.ok) {
      return sendJson(res, 413, { ok: false, error: { code: rawRead.error } });
    }
    const rawBody = rawRead.raw;

    if (!rawBody || rawBody.length === 0) {
      return sendJson(res, 400, { ok: false, error: { code: "EMPTY_BODY" } });
    }

    // 3) Signature header
    const sigHeaderName = (process.env.BANK_WEBHOOK_SIGNATURE_HEADER || DEFAULT_SIG_HEADER).trim();
    const providedSigRaw = normalizeSignature(getHeaderValue(req, sigHeaderName));

    if (!providedSigRaw) {
      return sendJson(res, 401, {
        ok: false,
        error: { code: "SIGNATURE_MISSING", message: `Missing signature header: ${sigHeaderName}` },
      });
    }

    // 4) Compute expected signature and compare (timing-safe)
    const expected = computeHmac(secret, rawBody);

    // We compare against provided signature in a flexible way:
    // - If provided looks hex => compare raw digest buffers
    // - Else compare base64 strings (or raw string buffers)
    let providedBuf = null;
    let expectedBuf = null;

    if (isHex(providedSigRaw)) {
      providedBuf = hexToBufferSafe(providedSigRaw);
      expectedBuf = expected.raw;
    } else {
      // try base64 decode; if it fails, compare as plain base64 string
      const b64Buf = base64ToBufferSafe(providedSigRaw);
      if (b64Buf && b64Buf.length === expected.raw.length) {
        providedBuf = b64Buf;
        expectedBuf = expected.raw;
      } else {
        // compare textual base64 digest
        providedBuf = Buffer.from(providedSigRaw, "utf8");
        expectedBuf = expected.b64;
      }
    }

    if (!timingSafeEqualBuffers(providedBuf, expectedBuf)) {
      return sendJson(res, 401, { ok: false, error: { code: "SIGNATURE_INVALID" } });
    }

    // 5) Parse JSON AFTER signature check
    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      return sendJson(res, 400, { ok: false, error: { code: "INVALID_JSON" } });
    }

    // 6) Idempotency key (fail-closed for payments safety)
    const idField = (process.env.BANK_WEBHOOK_ID_FIELD || DEFAULT_ID_FIELD).trim();
    const eventId = payload && typeof payload[idField] === "string" ? payload[idField].trim() : "";

    if (!eventId) {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: "MISSING_TRANSACTION_ID",
          message: `Missing required id field "${idField}". Configure BANK_WEBHOOK_ID_FIELD if needed.`,
        },
      });
    }

    const lock = await acquireIdempotencyLock(eventId);
    if (!lock.ok) {
      // Fail-closed for payments: if Redis is not configured, do NOT process payments
      return sendJson(res, 501, {
        ok: false,
        error: {
          code: "REDIS_NOT_CONFIGURED",
          message: "Redis is required for webhook idempotency.",
        },
      });
    }

    if (!lock.isNew) {
      // Duplicate delivery: acknowledge without re-processing
      return sendJson(res, 200, { ok: true, duplicate: true });
    }

    // 7) Business logic placeholder (no bank spec yet)
    // At this stage the request is authentic + idempotent.
    // Next step (when bank spec is known): validate amount/currency/status/user mapping and update DB/premium.
    return sendJson(res, 200, { ok: true, received: true });
  } catch {
    return sendJson(res, 500, { ok: false, error: { code: "SERVER_ERROR" } });
  }
}
