// api/auth/google.js
/*********************************************************
 * BetEngine Enterprise – AUTH API (GOOGLE) – v1.1
 * POST /api/auth/google
 *
 * Flow:
 * - Browser obtains a Google ID token (GIS) and sends it as `credential`.
 * - Server verifies the ID token via Google's tokeninfo endpoint.
 * - On success, sets the SAME signed HttpOnly cookie session format
 *   expected by /api/auth/me: payloadB64Url + "." + sigB64Url (HMAC-SHA256)
 *
 * ENV:
 * - GOOGLE_CLIENT_ID (required)
 * - AUTH_SESSION_SECRET (required) – HMAC signing secret for be_session
 *********************************************************/

import crypto from "crypto";

const COOKIE_NAME = "be_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
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

function base64UrlFromBuffer(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlEncodeJson(obj) {
  const json = JSON.stringify(obj);
  return base64UrlFromBuffer(Buffer.from(json, "utf8"));
}

function hmacSha256Base64Url(secret, data) {
  const mac = crypto.createHmac("sha256", secret).update(data, "utf8").digest();
  return base64UrlFromBuffer(mac);
}

function safeJsonBody(req) {
  const b = req.body;
  if (!b) return null;
  if (typeof b === "object") return b;
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return null;
    }
  }
  return null;
}

function buildUsername(email, name) {
  const fromEmail = String(email || "").split("@")[0] || "";
  const raw = fromEmail || String(name || "").replace(/\s+/g, "").toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9_\-]/g, "").slice(0, 24);
  return cleaned || "user";
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }

    const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
    if (!clientId) {
      return sendJson(res, 501, {
        ok: false,
        error: { code: "GOOGLE_NOT_CONFIGURED", message: "Google login is not configured yet." }
      });
    }

    const sessionSecret = String(process.env.AUTH_SESSION_SECRET || "").trim();
    if (!sessionSecret) {
      return sendJson(res, 501, {
        ok: false,
        error: { code: "AUTH_NOT_CONFIGURED", message: "Missing AUTH_SESSION_SECRET." }
      });
    }

    const body = safeJsonBody(req);
    const credential = String(body?.credential || "").trim();

    if (!credential) {
      return sendJson(res, 400, {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Credential is required.",
          details: { field: "credential" }
        }
      });
    }

    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;

    let info = null;
    try {
      const r = await fetch(url, { method: "GET" });
      if (!r.ok) {
        return sendJson(res, 401, { ok: false, error: { code: "GOOGLE_IDTOKEN_INVALID" } });
      }
      info = await r.json();
    } catch {
      return sendJson(res, 502, { ok: false, error: { code: "GOOGLE_VERIFY_FAILED" } });
    }

    const aud = String(info?.aud || "").trim();
    const sub = String(info?.sub || "").trim();
    const email = String(info?.email || "").trim();
    const emailVerified = String(info?.email_verified || "").trim();
    const name = String(info?.name || "").trim();
    const picture = String(info?.picture || "").trim();

    if (!sub || aud !== clientId) {
      return sendJson(res, 401, { ok: false, error: { code: "GOOGLE_AUDIENCE_MISMATCH" } });
    }

    if (email && emailVerified && emailVerified !== "true") {
      return sendJson(res, 401, { ok: false, error: { code: "GOOGLE_EMAIL_NOT_VERIFIED" } });
    }

    const user = {
      id: `google:${sub}`,
      username: buildUsername(email, name),
      email: email || null,
      name: name || null,
      picture: picture || null
    };

    const exp = Date.now() + SESSION_TTL_MS;
    const sessionPayload = { user, role: "user", premium: false, exp };

    // SIGNED COOKIE FORMAT: payloadB64Url.signatureB64Url
    const payloadB64Url = base64UrlEncodeJson(sessionPayload);
    const sigB64Url = hmacSha256Base64Url(sessionSecret, payloadB64Url);
    const cookieValue = `${payloadB64Url}.${sigB64Url}`;

    setCookie(res, COOKIE_NAME, encodeURIComponent(cookieValue), {
      path: "/",
      httpOnly: true,
      secure: isHttps(req),
      sameSite: "Lax",
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });

    return sendJson(res, 200, {
      ok: true,
      authenticated: true,
      user,
      role: "user",
      premium: false
    });
  } catch {
    return sendJson(res, 500, { ok: false, error: { code: "SERVER_ERROR" } });
  }
}
