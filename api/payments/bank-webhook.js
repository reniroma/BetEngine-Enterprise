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
 * - By default expects signature header: x-webhook-signature
 *
 * Notes:
 * - Uses RAW body bytes for HMAC validation (do NOT JSON.parse before verification)
 * - Returns 405 for non-POST
 * - Returns 401 for missing/invalid signature
 * - Returns 200 for duplicate transactionId (idempotency)
 *********************************************************/

import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_SIGNATURE_HEADER = "x-webhook-signature";
const DEFAULT_ID_FIELD = "transactionId";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24h

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
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
  // Returns the raw digest bytes plus canonical encodings for optional comparisons
  const h = createHmac("sha256", secret);
  h.update(rawBodyBuffer);
  const digest = h.digest(); // Buffer (32 bytes for SHA-256)
  return {
    raw: digest,
    hex: digest.toString("hex"),
    base64: digest.toString("base64"),
  };
}

async function redisSetNX(key, value, ttlSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return { ok: false, error: "REDIS_NOT_CONFIGURED" };
  }

  // Upstash REST: SET key value NX EX ttl
  const endpoint = `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(
    value
  )}?nx=true&ex=${encodeURIComponent(String(ttlSeconds))}`;

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp.ok) {
    return { ok: false, error: `REDIS_HTTP_${resp.status}` };
  }

  const data = await resp.json().catch(() => null);
  // Upstash typically returns: { result: "OK" } or { result: null } when NX fails
  const result = data && Object.prototype.hasOwnProperty.call(data, "result") ? data.result : null;
  const isNew = result === "OK";

  return { ok: true, isNew, raw: data };
}

export default async function handler(req, res) {
  // 1) Method guard
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
  }

  try {
    // 2) Ensure configured
    const secret = (process.env.BANK_WEBHOOK_SECRET || "").trim();
    if (!secret) {
      return sendJson(res, 501, { ok: false, error: { code: "WEBHOOK_NOT_CONFIGURED" } });
    }

    const sigHeaderName = (process.env.BANK_WEBHOOK_SIGNATURE_HEADER || DEFAULT_SIGNATURE_HEADER).trim();
    const signatureHeader = req.headers[sigHeaderName] || req.headers[sigHeaderName.toLowerCase()];
    const providedSigRaw = normalizeSignature(Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader);

    // 3) Read RAW body (bytes)
    const rawBody = await readRawBody(req);

    if (!providedSigRaw) {
      return sendJson(res, 401, {
        ok: false,
        error: { code: "SIGNATURE_MISSING", message: `Missing signature header: ${sigHeaderName}` },
      });
    }

    // 4) Compute expected signature and compare (timing-safe)
    const expected = computeHmac(secret, rawBody);

    // We compare against provided signature in a flexible way:
    // - If provided looks hex => decode hex and compare digest bytes
    // - Else try base64 decode and compare digest bytes
    // - Else compare base64 string representation (constant-time buffer compare)
    let providedBuf = null;
    let expectedBuf = null;

    if (isHex(providedSigRaw)) {
      providedBuf = hexToBufferSafe(providedSigRaw);
      expectedBuf = expected.raw;
    } else {
      const b64Buf = base64ToBufferSafe(providedSigRaw);
      if (b64Buf && b64Buf.length === expected.raw.length) {
        providedBuf = b64Buf;
        expectedBuf = expected.raw;
      } else {
        providedBuf = Buffer.from(providedSigRaw, "utf8");
        expectedBuf = Buffer.from(expected.base64, "utf8");
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
    const txId = payload && typeof payload === "object" ? payload[idField] : null;

    if (!txId || typeof txId !== "string") {
      return sendJson(res, 400, { ok: false, error: { code: "MISSING_TRANSACTION_ID", field: idField } });
    }

    const ttl = Number(process.env.BANK_WEBHOOK_IDEMPOTENCY_TTL || DEFAULT_TTL_SECONDS);
    const idemKey = `be:bank:webhook:${txId}`;

    const setRes = await redisSetNX(idemKey, "1", Number.isFinite(ttl) ? ttl : DEFAULT_TTL_SECONDS);
    if (!setRes.ok) {
      // Fail-closed: do not process payments without idempotency safety
      return sendJson(res, 501, { ok: false, error: { code: setRes.error || "REDIS_ERROR" } });
    }

    if (!setRes.isNew) {
      return sendJson(res, 200, { ok: true, duplicate: true });
    }

    // 7) Business logic placeholder (DB / premium activation) – intentionally not implemented here yet.
    //    Next enterprise step: write premium_payments record and activate premium deterministically.

    return sendJson(res, 200, { ok: true, received: true });
  } catch (err) {
    // Hard fail: never expose internals
    return sendJson(res, 500, { ok: false, error: { code: "INTERNAL_ERROR" } });
  }
}
