/*********************************************************
 * BetEngine Enterprise – AUTH API (COOKIE SESSION)
 * POST /api/auth/forgot-password
 *
 * Behavior:
 * - Always returns 200 JSON for POST (no user enumeration)
 * - Accepts: email OR forgot_email OR forgotEmail
 * - Does NOT send real email (stub) — removes 404 and closes flow
 *********************************************************/

"use strict";

function safeJson(res, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 200;
  return res.end(JSON.stringify(payload));
}

function readRawBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", () => resolve(""));
  });
}

function parseBody(req, raw) {
  const ct = String(req.headers["content-type"] || "").toLowerCase();

  // JSON
  if (ct.includes("application/json")) {
    try {
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  // URL-encoded (fallback)
  if (ct.includes("application/x-www-form-urlencoded")) {
    try {
      const obj = {};
      const params = new URLSearchParams(raw || "");
      for (const [k, v] of params.entries()) obj[k] = v;
      return obj;
    } catch (_) {
      return {};
    }
  }

  // Best-effort: try JSON, else empty
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function pickEmail(body) {
  if (!body || typeof body !== "object") return "";

  const candidates = [
    body.email,
    body.forgot_email,
    body.forgotEmail,
    body.forgot,
  ];

  for (const v of candidates) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }

  return "";
}

function isValidEmail(s) {
  if (!s) return false;
  // Minimal validation (do not over-reject)
  return s.includes("@") && s.includes(".") && s.length <= 254;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  const raw = await readRawBody(req);
  const body = parseBody(req, raw);

  const email = pickEmail(body);

  // Do not reveal whether the account exists.
  // Stub behavior: always OK for POST.
  return safeJson(res, {
    ok: true,
    accepted: isValidEmail(email),
    message: "If the account exists, a reset link will be sent to the email.",
  });
};
