/*********************************************************
 * BetEngine Enterprise – AUTH API (FACEBOOK) – Callback
 * GET /api/auth/facebook/callback?code=...&state=...
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

function clearCookie(res, name) {
  setCookie(res, name, "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(0)
  });
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header || typeof header !== "string") return out;

  const pairs = header.split(";").map((s) => s.trim()).filter(Boolean);
  for (const p of pairs) {
    const i = p.indexOf("=");
    if (i < 0) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    out[k] = v;
  }
  return out;
}

function base64UrlEncode(buf) {
  const b64 = Buffer.isBuffer(buf) ? buf.toString("base64") : Buffer.from(buf).toString("base64");
  return b64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlEncodeJson(obj) {
  return base64UrlEncode(Buffer.from(JSON.stringify(obj), "utf8"));
}

function hmacSha256Base64Url(secret, data) {
  const h = crypto.createHmac("sha256", secret);
  h.update(data, "utf8");
  return base64UrlEncode(h.digest());
}

function makeSignedSessionCookie(secret, sessionPayloadObj) {
  const payloadB64 = base64UrlEncodeJson(sessionPayloadObj);
  const sigB64 = hmacSha256Base64Url(secret, payloadB64);
  return `${payloadB64}.${sigB64}`;
}

function redirect(res, location, status = 302) {
  res.statusCode = status;
  res.setHeader("Location", location);
  res.end();
}

function buildUsername(name, id) {
  const raw = (name || "").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const base = raw || `fb_${String(id || "").slice(0, 10)}`;
  return base.slice(0, 24) || "user";
}

async function exchangeCodeForAccessToken({ code, appId, appSecret, redirectUri }) {
  const url = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const r = await fetch(url.toString(), { method: "GET" });
  const data = await r.json().catch(() => null);
  if (!r.ok) return { ok: false, data };
  return { ok: true, data };
}

async function fetchFacebookUser(accessToken) {
  const url = new URL("https://graph.facebook.com/me");
  url.searchParams.set("fields", "id,name,email,picture.width(96).height(96)");
  url.searchParams.set("access_token", accessToken);

  const r = await fetch(url.toString(), { method: "GET" });
  const data = await r.json().catch(() => null);
  if (!r.ok) return null;
  return data;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return sendJson(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
    }

    const appId = String(process.env.FACEBOOK_APP_ID || "").trim();
    const appSecret = String(process.env.FACEBOOK_APP_SECRET || "").trim();
    const sessionSecret = String(process.env.AUTH_SESSION_SECRET || "").trim();

    if (!appId || !appSecret || !sessionSecret) {
      return sendJson(res, 501, {
        ok: false,
        error: { code: "FACEBOOK_NOT_CONFIGURED", message: "Facebook login is not configured." }
      });
    }

    const redirectUri =
      String(process.env.FACEBOOK_REDIRECT_URI || "").trim() ||
      buildAbsoluteUrl(req, "/api/auth/facebook/callback");

    const urlObj = new URL(req.url || "/api/auth/facebook/callback", buildAbsoluteUrl(req, "/"));
    const code = String(urlObj.searchParams.get("code") || "").trim();
    const state = String(urlObj.searchParams.get("state") || "").trim();

    // Read & clear temp cookies
    const cookies = parseCookies(req);
    const expectedState = cookies["be_fb_oauth_state"] ? decodeURIComponent(cookies["be_fb_oauth_state"]) : "";
    const returnTo = cookies["be_fb_oauth_return"] ? decodeURIComponent(cookies["be_fb_oauth_return"]) : "/";

    clearCookie(res, "be_fb_oauth_state");
    clearCookie(res, "be_fb_oauth_return");

    if (!code) {
      return sendJson(res, 400, { ok: false, error: { code: "OAUTH_CODE_MISSING" } });
    }

    if (!state || !expectedState || state !== expectedState) {
      return sendJson(res, 401, { ok: false, error: { code: "OAUTH_STATE_INVALID" } });
    }

    const ex = await exchangeCodeForAccessToken({ code, appId, appSecret, redirectUri });
    if (!ex.ok) {
      return sendJson(res, 401, {
        ok: false,
        error: { code: "OAUTH_CODE_EXCHANGE_FAILED" },
        details: ex.data || null
      });
    }

    const accessToken = String(ex.data?.access_token || "").trim();
    if (!accessToken) {
      return sendJson(res, 401, { ok: false, error: { code: "OAUTH_NO_ACCESS_TOKEN" } });
    }

    const fbUser = await fetchFacebookUser(accessToken);
    if (!fbUser || !fbUser.id) {
      return sendJson(res, 401, { ok: false, error: { code: "FACEBOOK_USER_FETCH_FAILED" } });
    }

    const user = {
      id: `facebook:${String(fbUser.id)}`,
      username: buildUsername(fbUser.name, fbUser.id),
      email: fbUser.email || null,
      name: fbUser.name || null,
      picture: fbUser.picture?.data?.url || null
    };

    const exp = Date.now() + SESSION_TTL_MS;
    const sessionPayload = { user, role: "user", premium: false, exp };
    const cookieValue = makeSignedSessionCookie(sessionSecret, sessionPayload);

    setCookie(res, COOKIE_NAME, encodeURIComponent(cookieValue), {
      path: "/",
      httpOnly: true,
      secure: isHttps(req),
      sameSite: "Lax",
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    });

    return redirect(res, returnTo || "/", 302);
  } catch {
    return sendJson(res, 500, { ok: false, error: { code: "SERVER_ERROR" } });
  }
}
