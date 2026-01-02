/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGIN) – NO STUB
 * POST /api/auth/login
 *
 * Vercel Serverless Function (Node)
 * - Validates credentials against a fixed test user list
 * - Sets HttpOnly cookie session ONLY on success
 *********************************************************/
"use strict";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// TEMP: fixed test users (Phase 1)
// You can move these to env vars later.
const USERS = [
  { id: "user-1", email: "test@betengine.com", username: "test", password: "Test12345", role: "user", premium: false },
  { id: "user-2", email: "test2@betengine.com", username: "testuser2", password: "Test12345", role: "user", premium: false }
];

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

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  return res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  const body = await readJsonBody(req);

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const email = emailRaw.toLowerCase();

  if (!email || !password) {
    return json(res, 400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Email and password are required",
        details: { fields: ["email", "password"] }
      }
    });
  }

  const match = USERS.find(u => u.email === email);

  // INVALID CREDENTIALS (NO COOKIE)
  if (!match || match.password !== password) {
    return json(res, 401, {
      error: { code: "INVALID_CREDENTIALS" }
    });
  }

  // SUCCESS: build session payload exactly as /api/auth/me expects
  const user = { id: match.id, username: match.username, email: match.email };
  const exp = Date.now() + SESSION_TTL_MS;

  const sessionPayload = { user, role: match.role, premium: !!match.premium, exp };
  const cookieValue = base64UrlEncodeJson(sessionPayload);

  setCookie(res, COOKIE_NAME, encodeURIComponent(cookieValue), {
    path: "/",
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "Lax",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  });

  return json(res, 200, {
    authenticated: true,
    user,
    role: match.role,
    premium: !!match.premium
  });
};
