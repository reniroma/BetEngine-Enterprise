/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGIN STUB) – FIXED
 * POST /api/auth/login
 *
 * Vercel Serverless Function (Node)
 * Sets HttpOnly cookie session compatible with /api/auth/me
 *
 * COOKIE FORMAT (MUST MATCH /api/auth/me):
 *   be_session = base64url(JSON.stringify({ user, role, premium, exp }))
 *********************************************************/
"use strict";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isHttps(req) {
  const proto = req.headers["x-forwarded-proto"];
  if (typeof proto === "string") return proto.toLowerCase().includes("https");
  return false;
}

function base64UrlEncodeString(str) {
  const b64 = Buffer.from(str, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

function normalizeUsernameFromEmail(email) {
  if (typeof email !== "string") return "user";
  const e = email.trim();
  if (!e) return "user";
  if (e.includes("@")) return e.split("@")[0] || "user";
  return e || "user";
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

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Minimal validation (stub)
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

  // STUB user (replace later with real auth lookup)
  const user = {
    id: "stub-1",
    username: normalizeUsernameFromEmail(email),
    email
  };

  const sessionPayload = {
    user,
    role: "user",
    premium: false,
    exp: Date.now() + SESSION_TTL_MS
  };

  const sessionValue = base64UrlEncodeString(JSON.stringify(sessionPayload));

  const secure = isHttps(req);
  const expires = new Date(sessionPayload.exp);
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);

  setCookie(res, COOKIE_NAME, sessionValue, {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "Lax",
    expires,
    maxAge
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
