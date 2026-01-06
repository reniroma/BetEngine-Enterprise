/*********************************************************
 * BetEngine Enterprise – AUTH API (COOKIE SESSION)
 * GET /api/auth/me
 *
 * Behavior:
 * - Always returns 200 (no console noise)
 * - If session cookie exists -> authenticated true
 * - If missing/invalid/expired -> authenticated false (and clears cookie)
 *********************************************************/

"use strict";

const COOKIE_NAME = "be_session";

function parseCookies(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) return;
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function base64UrlToString(b64url) {
  // base64url -> base64
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

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

function clearSessionCookie(res, req) {
  setCookie(res, COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "Lax",
    expires: new Date(0),
  });
}

function safeResponse(res, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 200;
  return res.end(JSON.stringify(payload));
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  const username =
    typeof user.username === "string" && user.username.trim()
      ? user.username.trim()
      : (typeof user.email === "string" && user.email.includes("@")
          ? user.email.split("@")[0]
          : "user");

  return { ...user, username };
}

module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const raw = cookies[COOKIE_NAME];

    if (!raw) {
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    // Expected cookie payload: base64url(JSON.stringify({ user, role, premium, exp }))
    const jsonStr = base64UrlToString(raw);
    const data = JSON.parse(jsonStr);

    const exp = typeof data.exp === "number" ? data.exp : null;
    if (exp && Date.now() > exp) {
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    const user = normalizeUser(data.user);
    if (!user) {
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    return safeResponse(res, {
      authenticated: true,
      user,
      role: typeof data.role === "string" && data.role ? data.role : "user",
      premium: !!data.premium,
    });
  } catch (e) {
    // Any parse error -> clear cookie and return unauth safely
    clearSessionCookie(res, req);
    return safeResponse(res, {
      authenticated: false,
      user: null,
      role: "user",
      premium: false,
    });
  }
};
