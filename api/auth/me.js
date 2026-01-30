/*********************************************************
 * BetEngine Enterprise – AUTH API (SIGNED COOKIE SESSION)
 * GET /api/auth/me
 *
 * Behavior:
 * - Always returns 200 (no console noise)
 * - If session cookie exists and is valid -> authenticated true
 * - If missing/invalid/expired -> authenticated false (and clears cookie)
 *
 * Signed cookie format:
 * - be_session = <payload_b64url>.<sig_b64url>
 * - sig = HMAC_SHA256(AUTH_SESSION_SECRET, payload_b64url)
 *********************************************************/

import { createHmac, timingSafeEqual } from "node:crypto";

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
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  return Buffer.from(b64 + pad, "base64").toString("utf8");
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

function safeSigEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
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

export default function handler(req, res) {
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

    const secret = (process.env.AUTH_SESSION_SECRET || "").trim();
    if (!secret) {
      // Fail-closed: clear any existing cookie and return unauthenticated
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    // Expected cookie value: <payload_b64url>.<sig_b64url>
    const dot = raw.indexOf(".");
    if (dot === -1) {
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    const payloadB64Url = raw.slice(0, dot);
    const sigB64Url = raw.slice(dot + 1);

    if (!payloadB64Url || !sigB64Url) {
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    const expectedSig = signPayloadB64Url(payloadB64Url);
    if (!expectedSig || !safeSigEqual(expectedSig, sigB64Url)) {
      clearSessionCookie(res, req);
      return safeResponse(res, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false,
      });
    }

    const jsonStr = base64UrlToString(payloadB64Url);
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
  } catch {
    clearSessionCookie(res, req);
    return safeResponse(res, {
      authenticated: false,
      user: null,
      role: "user",
      premium: false,
    });
  }
}
