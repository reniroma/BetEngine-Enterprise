/*********************************************************
 * BetEngine Enterprise – AUTH API (FACEBOOK) – Redirect Start
 * GET /api/auth/facebook?returnTo=...
 *********************************************************/

import crypto from "crypto";

const OAUTH_COOKIE_TTL_S = 10 * 60; // 10 minutes

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

function getHost(req) {
  const xfHost = req.headers["x-forwarded-host"];
  if (typeof xfHost === "string" && xfHost.trim()) return xfHost.trim();
  const host = req.headers["host"];
  return typeof host === "string" ? host : "";
}

function buildAbsoluteUrl(req, pathAndQuery = "/") {
  const proto = isHttps(req) ? "https" : "http";
  const host = getHost(req);
  return `${proto}://${host}${pathAndQuery}`;
}

function appendSetCookie(res, cookieStr) {
  const prev = res.getHeader("Set-Cookie");
  if (!prev) {
    res.setHeader("Set-Cookie", cookieStr);
    return;
  }
  if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", [...prev, cookieStr]);
    return;
  }
  res.setHeader("Set-Cookie", [String(prev), cookieStr]);
}

function setCookie(res, name, value, opts = {}) {
  const parts = [];
  parts.push(`${name}=${value}`);
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  parts.push(`Path=${opts.path || "/"}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  appendSetCookie(res, parts.join("; "));
}

function randomBase64Url(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function redirect(res, location, status = 302) {
  res.statusCode = status;
  res.setHeader("Location", location);
  res.end();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }

    const appId = String(process.env.FACEBOOK_APP_ID || "").trim();
    const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();

    if (!appId || !appSecret) {
      return sendJson(res, 501, {
        ok: false,
        error: { code: "FACEBOOK_NOT_CONFIGURED", message: "Facebook login is not configured." }
      });
    }

    const urlObj = new URL(req.url || "/api/auth/facebook", buildAbsoluteUrl(req, "/"));
    const returnTo = String(urlObj.searchParams.get("returnTo") || "/").trim() || "/";

    // IMPORTANT: This must match Meta "Valid OAuth Redirect URIs" EXACTLY
    const redirectUri =
      String(process.env.FACEBOOK_REDIRECT_URI || "").trim() ||
      buildAbsoluteUrl(req, "/api/auth/facebook/callback");

    const state = randomBase64Url(24);

    // Save anti-CSRF state + returnTo in HttpOnly temp cookies
    setCookie(res, "be_fb_oauth_state", encodeURIComponent(state), {
      path: "/",
      httpOnly: true,
      secure: isHttps(req),
      sameSite: "Lax",
      maxAge: OAUTH_COOKIE_TTL_S
    });

    setCookie(res, "be_fb_oauth_return", encodeURIComponent(returnTo), {
      path: "/",
      httpOnly: true,
      secure: isHttps(req),
      sameSite: "Lax",
      maxAge: OAUTH_COOKIE_TTL_S
    });

    // Build Facebook OAuth URL
    const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "email,public_profile");

    return redirect(res, authUrl.toString(), 302);
  } catch {
    return sendJson(res, 500, { ok: false, error: { code: "SERVER_ERROR" } });
  }
}
