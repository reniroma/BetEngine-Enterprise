// api/auth/me.js
export const config = { runtime: "nodejs" };

const COOKIE_NAME = "be_session";

function isHttps(req) {
  const proto = req.headers["x-forwarded-proto"];
  if (typeof proto === "string") return proto.toLowerCase().includes("https");
  return true; // Vercel prod is https
}

function setCookie(res, name, value, opts = {}) {
  let cookie = `${name}=${value}`;
  if (opts.maxAge != null) cookie += `; Max-Age=${opts.maxAge}`;
  if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`;
  cookie += `; Path=${opts.path || "/"}`;
  if (opts.httpOnly) cookie += "; HttpOnly";
  if (opts.secure) cookie += "; Secure";
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res, req) {
  setCookie(res, COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "Lax"
  });
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;

  cookieHeader.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });

  return out;
}

function base64UrlToString(b64url) {
  // Works in both Node (Buffer) and Edge runtimes (atob/TextDecoder)
  const b64 = String(b64url || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const data = b64 + pad;

  // Node / Serverless
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data, "base64").toString("utf8");
  }

  // Edge runtime fallback
  const bin = atob(data);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

export default function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.end(
        JSON.stringify({ authenticated: false, user: null, role: "user", premium: false })
      );
    }

    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies[COOKIE_NAME];

    if (!raw) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.end(
        JSON.stringify({ authenticated: false, user: null, role: "user", premium: false })
      );
    }

    let session;
    try {
      session = JSON.parse(base64UrlToString(raw));
    } catch {
      clearSessionCookie(res, req);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.end(
        JSON.stringify({ authenticated: false, user: null, role: "user", premium: false })
      );
    }

    const exp = Number(session?.exp || 0);
    if (!exp || Date.now() > exp) {
      clearSessionCookie(res, req);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.end(
        JSON.stringify({ authenticated: false, user: null, role: "user", premium: false })
      );
    }

    const user = session?.user || null;
    const role = session?.role || "user";
    const premium = !!session?.premium;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.end(JSON.stringify({ authenticated: true, user, role, premium }));
  } catch {
    // Never 500 for /me. Fail safe.
    try {
      clearSessionCookie(res, req);
    } catch {}
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.end(
      JSON.stringify({ authenticated: false, user: null, role: "user", premium: false })
    );
  }
}
