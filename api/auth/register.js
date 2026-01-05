/*********************************************************
 * BetEngine Enterprise – AUTH API (REGISTER STUB) – v1.2
 * POST /api/auth/register
 *
 * Vercel Serverless Function (Node)
 * Sets HttpOnly cookie session (stub)
 *
 * COMPATIBILITY FIXES:
 * - STRICT validation: username + email + password required
 * - Duplicate protection (best-effort): username/email uniqueness
 * - Error shape matches auth-api.js normalizeError()
 * - Uses 201 Created on success
 *********************************************************/
"use strict";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Best-effort in-memory store for warm invocations
const STORE =
  globalThis.__BE_AUTH_STUB_STORE__ ||
  (globalThis.__BE_AUTH_STUB_STORE__ = {
    emails: new Set(),
    usernames: new Set(),
    nextId: 1
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

async function readJsonBody(req) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
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
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  return (req.socket && req.socket.remoteAddress) ? String(req.socket.remoteAddress) : "unknown";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function normalizeUsername(v) {
  return typeof v === "string" ? v.trim() : "";
}

function validateUsername(u) {
  // Keep simple but strict for stub stage
  if (!u) return false;
  if (u.length < 3 || u.length > 24) return false;
  // allow letters/numbers/._-
  return /^[a-zA-Z0-9._-]+$/.test(u);
}

function validatePassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 128;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  // Rate limit (enterprise, serverless-safe). Fail-open if misconfigured.
  try {
    const { rateLimit } = await import("../../backend/api/_rateLimit.js");
    const ip = getClientIp(req);
    const key = `auth:register:${ip}`;
    const rl = await rateLimit({ key, limit: 3, window: 10 * 60 });

    if (!rl || rl.allowed !== true) {
      return sendJson(res, 429, {
        ok: false,
        error: "RATE_LIMITED",
        message: "Too many attempts. Please try again later."
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

  // STRICT fields required (matches auth-api.js + header-auth.js expectations)
  const missing = [];
  if (!username) missing.push("username");
  if (!email) missing.push("email");
  if (!password) missing.push("password");

  if (missing.length) {
    return sendJson(res, 400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Username, email, and password are required",
        details: { fields: missing }
      }
    });
  }

  if (!validateUsername(username) || !EMAIL_RE.test(email) || !validatePassword(password)) {
    return sendJson(res, 400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid username, email, or password",
        details: {
          usernameOk: validateUsername(username),
          emailOk: EMAIL_RE.test(email),
          passwordOk: validatePassword(password)
        }
      }
    });
  }

  // Duplicate protection (best-effort)
  if (STORE.emails.has(email)) {
    return sendJson(res, 409, {
      error: {
        code: "USER_EXISTS",
        message: "Email is already registered",
        details: { field: "email" }
      }
    });
  }

  if (STORE.usernames.has(username.toLowerCase())) {
    return sendJson(res, 409, {
      error: {
        code: "USER_EXISTS",
        message: "Username is already taken",
        details: { field: "username" }
      }
    });
  }

  // Register (stub)
  const user = {
    id: `stub-reg-${STORE.nextId++}`,
    username,
    email
  };

  STORE.emails.add(email);
  STORE.usernames.add(username.toLowerCase());

  const exp = Date.now() + SESSION_TTL_MS;
  const sessionPayload = { user, role: "user", premium: false, exp };
  const cookieValue = base64UrlEncodeJson(sessionPayload);

  setCookie(res, COOKIE_NAME, encodeURIComponent(cookieValue), {
    path: "/",
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "Lax",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  });

  return sendJson(res, 201, {
    authenticated: true,
    user,
    role: "user",
    premium: false
  });
};
