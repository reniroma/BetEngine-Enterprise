/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGIN)
 * POST /api/auth/login
 *
 * TEST CREDENTIALS (TEMP):
 * - email:    test@betengine.com
 * - password: Test123!
 *
 * Sets HttpOnly cookie session:
 * base64url(JSON.stringify({ user, role, premium, exp }))
 *********************************************************/
"use strict";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const TEST_EMAIL = "test@betengine.com";
const TEST_PASSWORD = "Test123!";

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
    return {};
  }
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

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  // RATE LIMIT (STORE) — fail open
  try {
    const { rateLimit } = await import("../../backend/api/_rateLimit.js");
    const ip = getClientIp(req);
    const key = `auth:login:${ip}`;
    const rl = await rateLimit({ key, limit: 5, window: 5 * 60 });

    if (!rl || rl.allowed !== true) {
      res.statusCode = 429;
      return res.end(
        JSON.stringify({
          ok: false,
          error: "RATE_LIMITED",
          message: "Too many attempts. Please try again later."
        })
      );
    }
  } catch {
    // Fail open: do not block auth if rate limiter is misconfigured
  }

  const body = await readJsonBody(req);

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required",
          details: { fields: ["email", "password"] }
        }
      })
    );
  }

  // TEMP TEST AUTH ONLY
  if (email.toLowerCase() !== TEST_EMAIL || password !== TEST_PASSWORD) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: { code: "INVALID_CREDENTIALS" } }));
  }

  const user = {
    id: "user-test-1",
    username: "test",
    email: TEST_EMAIL
  };

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

  res.statusCode = 200;
  return res.end(
    JSON.stringify({
      authenticated: true,
      user,
      role: "user",
      premium: false
    })
  );
};
