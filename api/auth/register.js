/*********************************************************
 * BetEngine Enterprise – AUTH API (REGISTER STUB) – v1.3
 * POST /api/auth/register
 *
 * Vercel Serverless Function (Node, ESM)
 * Sets HttpOnly session cookie (HMAC signed, matches login.js)
 *
 * Enterprise fixes:
 * - Anti-enumeration: no "user exists" leakage (email/username)
 * - Signed cookie: be_session = <payload_b64url>.<sig_b64url>
 * - 405 returns JSON (no empty bodies)
 *********************************************************/
"use strict";

import { createHmac } from "node:crypto";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Best-effort in-memory store for warm invocations (stub only; NOT durable on serverless)
const STORE =
  globalThis.__BE_AUTH_STUB_STORE__ ||
  (globalThis.__BE_AUTH_STUB_STORE__ = {
    emails: new Set(),
    usernames: new Set(),
    nextId: 1,
  });

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

async function readJsonBody(req) {
  try {
    const chunks = [];
    let total = 0;

    for await (const chunk of req) {
      total += chunk.length || 0;
      if (total > 64 * 1024) return null; // prevent oversized payload
      chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString("utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(payload));
}

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) return xff.split(",")[0].trim();
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return req.socket && req.socket.remoteAddress ? String(req.socket.remoteAddress) : "unknown";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function normalizeUsername(v) {
  return typeof v === "string" ? v.trim() : "";
}

function validateUsername(u) {
  if (!u) return false;
  if (u.length < 3 || u.length > 24) return false;
  return /^[a-zA-Z0-9._-]+$/.test(u);
}

function validatePassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 128;
}

function looksValidInput(username, email, password) {
  return validateUsername(username) && EMAIL_RE.test(email) && validatePassword(password);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: { code: "METHOD_NOT_ALLOWED" } });
  }

  // Rate limit (enterprise, serverless-safe). Fail-open if misconfigured.
  try {
    const mod = await import("../../backend/api/_rateLimit.js");
    const rateLimit = mod?.rateLimit || mod?.default?.rateLimit;
    const ip = getClientIp(req);
    const key = `auth:register:${ip}`;
    const rl = await rateLimit({ key, limit: 3, window: 10 * 60 });

    if (!rl || rl.allowed !== true) {
      return sendJson(res, 429, {
        ok: false,
        error: "RATE_LIMITED",
        message: "Too many attempts. Please try again later.",
      });
    }
  } catch {
    // Fail open: do not block auth if rate limiter is misconfigured
  }

  const body = await readJsonBody(req);
  if (!body) {
    return sendJson(res, 400, { error: { code: "INVALID_JSON", message: "Invalid JSON" } });
  }

  const username = normalizeUsername(body.username);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");

  if (missing.length) {
    return sendJson(res, 400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Username, email, and password are required",
        details: { fields: missing },
      },
    });
  }

  // Anti-enumeration:
  // - Do not reveal whether email/username exists.
  // - Do not return per-field validation booleans.
  if (!looksValidInput(username, email, password)) {
    return sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid username, email, or password" },
    });
  }

  // Duplicate protection (best-effort) WITHOUT leakage
  const emailExists = STORE.emails.has(email);
  const usernameExists = STORE.usernames.has(username.toLowerCase());
  if (emailExists || usernameExists) {
    return sendJson(res, 400, {
      error: { code: "VALIDATION_ERROR", message: "Invalid username, email, or password" },
    });
  }

  // Register (stub)
  const user = {
    id: `stub-reg-${STORE.nextId++}`,
    username,
    email,
  };

  STORE.emails.add(email);
  STORE.usernames.add(username.toLowerCase());

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

  return sendJson(res, 201, {
    authenticated: true,
    user,
    role: "user",
    premium: false,
  });
}
