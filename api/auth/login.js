// api/auth/login.js
/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGIN) – SAFE (ESM)
 * POST /api/auth/login
 *
 * Goals:
 * - Never crash (no 500 from unhandled exceptions)
 * - Always returns JSON
 * - Works on Vercel Serverless (ESM)
 * - Rate limit via ../../backend/api/_rateLimit.js (fail-open)
 *
 * Optional test credentials via ENV (NOT committed):
 * - AUTH_TEST_EMAIL
 * - AUTH_TEST_PASSWORD
 *
 * Session cookie (HMAC signed):
 * - be_session = <payload_b64url>.<sig_b64url>
 * - sig = HMAC_SHA256(AUTH_SESSION_SECRET, payload_b64url)
 *********************************************************/

import { createHmac } from "node:crypto";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isHttps(req) {
  const proto = req.headers["x-forwarded-proto"];
  if (typeof proto === "string") return proto.toLowerCase().includes("https");
  return false;
}

function setCookie(res, name, value, opts = {}) {
  const parts = [];
  parts.push(`${name}=${value}`);
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  res.setHeader("Set-Cookie", parts.join("; "));
}

function base64UrlEncodeJson(obj) {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function signPayloadB64Url(payloadB64Url) {
  const secret = (process.env.AUTH_SESSION_SECRET || "").trim();
  if (!secret) return null;
  const sigB64 = createHmac("sha256", secret).update(payloadB64Url, "utf8").digest("base64");
  return base64ToBase64Url(sigB64);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.socket && req.socket.remoteAddress ? String(req.socket.remoteAddress) : "unknown";
}

async function readJsonBody(req, limitBytes = 64 * 1024) {
  try {
    const chunks = [];
    let size = 0;

    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > limitBytes) return { __error: "BODY_TOO_LARGE" };
      chunks.push(buf);
    }

    const raw = Buffer.concat(chunks).toString("utf8");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return { __error: "INVALID_JSON" };
  }
}

async function loadRateLimit() {
  // Your file is: backend/api/_rateLimit.js (kept)
  const mod = await import("../../backend/api/_rateLimit.js");
  if (mod && typeof mod.rateLimit === "function") return mod.rateLimit;
  if (mod && mod.default && typeof mod.default.rateLimit === "function") return mod.default.rateLimit;
  if (mod && mod.default && typeof mod.default === "function") return mod.default;
  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Allow", "POST");
      return res.end();
    }

    // AUTH SECRET (required for signed cookie)
    const authSecret = (process.env.AUTH_SESSION_SECRET || "").trim();
    if (!authSecret) {
      return sendJson(res, 500, {
        ok: false,
        error: { code: "AUTH_SECRET_MISSING", message: "Server auth secret is not configured." },
      });
    }

    // RATE LIMIT (STORE) — fail-open
    try {
      const rateLimit = await loadRateLimit();
      if (rateLimit) {
        const ip = getClientIp(req);
        const key = `auth:login:${ip}`;
        const rl = await rateLimit({ key, limit: 5, window: 5 * 60 });
        if (!rl || rl.allowed !== true) {
          return sendJson(res, 429, {
            ok: false,
            error: "RATE_LIMITED",
            message: "Too many attempts. Please try again later.",
          });
        }
      }
    } catch {
      // Fail-open
    }

    const body = await readJsonBody(req);

    if (body && body.__error === "BODY_TOO_LARGE") {
      return sendJson(res, 413, { error: { code: "PAYLOAD_TOO_LARGE" } });
    }
    if (body && body.__error === "INVALID_JSON") {
      return sendJson(res, 400, { error: { code: "INVALID_JSON", message: "Invalid JSON" } });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return sendJson(res, 400, {
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required",
          details: { fields: ["email", "password"] },
        },
      });
    }

    const expectedEmail = (process.env.AUTH_TEST_EMAIL || "").trim();
    const expectedPassword = process.env.AUTH_TEST_PASSWORD || "";

    if (!expectedEmail || !expectedPassword) {
      return sendJson(res, 501, {
        error: { code: "AUTH_NOT_CONFIGURED", message: "Login is not configured yet." },
      });
    }

    if (email.toLowerCase() !== expectedEmail.toLowerCase() || password !== expectedPassword) {
      return sendJson(res, 401, { error: { code: "INVALID_CREDENTIALS" } });
    }

    const user = { id: "user-test-1", username: "test", email: expectedEmail };
    const exp = Date.now() + SESSION_TTL_MS;
    const sessionPayload = { user, role: "user", premium: false, exp };

    const payloadB64Url = base64UrlEncodeJson(sessionPayload);
    const sigB64Url = signPayloadB64Url(payloadB64Url);

    if (!sigB64Url) {
      return sendJson(res, 500, {
        ok: false,
        error: { code: "AUTH_SECRET_MISSING", message: "Server auth secret is not configured." },
      });
    }

    const cookieValue = `${payloadB64Url}.${sigB64Url}`;

    setCookie(res, COOKIE_NAME, encodeURIComponent(cookieValue), {
      path: "/",
      httpOnly: true,
      secure: isHttps(req),
      sameSite: "Lax",
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return sendJson(res, 200, {
      authenticated: true,
      user,
      role: "user",
      premium: false,
    });
  } catch {
    return sendJson(res, 500, { error: { code: "SERVER_ERROR" } });
  }
}
