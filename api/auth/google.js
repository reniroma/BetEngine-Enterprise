// api/auth/google.js
/*********************************************************
 * BetEngine Enterprise – AUTH API (GOOGLE) – v1.0
 * POST /api/auth/google
 *
 * Flow:
 * - Browser obtains a Google ID token (GIS) and sends it as `credential`.
 * - Server verifies the ID token via Google's tokeninfo endpoint.
 * - On success, sets the same HttpOnly cookie session used by login/register stubs.
 *
 * ENV:
 * - GOOGLE_CLIENT_ID (required) – used to validate `aud`.
 *********************************************************/

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

function base64UrlEncodeJson(obj) {
  const json = JSON.stringify(obj);
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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

    const body = safeJsonBody(req);
    const credential = String(body?.credential || "").trim();

    if (!credential) {
      return sendJson(res, 400, {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Credential is required.", details: { field: "credential" } }
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
    const cookieValue = base64UrlEncodeJson(sessionPayload);

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
