/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGOUT STUB) – FIXED
 * POST /api/auth/logout
 *
 * Vercel Serverless Function (Node)
 * Clears HttpOnly cookie session (enterprise-safe)
 *********************************************************/
"use strict";

const COOKIE_NAME = "be_session";

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

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  setCookie(res, COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "Lax",
    maxAge: 0,
    expires: new Date(0)
  });

  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
};
