/*********************************************************
 * BetEngine Enterprise – AUTH API (FORGOT PASSWORD)
 * POST /api/auth/forgot-password
 *
 * Goals:
 * - Always returns JSON (never HTML)
 * - Avoids user enumeration
 * - Safe, no throws, no console noise
 *********************************************************/

"use strict";

function safeJson(res, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 200;
  return res.end(JSON.stringify(payload));
}

function isEmail(s) {
  if (typeof s !== "string") return false;
  const v = s.trim();
  if (!v) return false;
  if (v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function readBody(req, limitBytes = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let data = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error("BODY_TOO_LARGE"));
        req.destroy();
        return;
      }
      data += chunk.toString("utf8");
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return safeJson(res, {
        ok: false,
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Use POST /api/auth/forgot-password",
      });
    }

    const raw = await readBody(req);
    let body = null;

    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return safeJson(res, {
        ok: false,
        success: false,
        error: "INVALID_JSON",
        message: "Request body must be valid JSON.",
      });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!isEmail(email)) {
      return safeJson(res, {
        ok: false,
        success: false,
        error: "INVALID_EMAIL",
        message: "Please enter a valid email address.",
      });
    }

    /*
      Placeholder behavior (safe):
      - Do NOT reveal whether email exists
      - Later you can integrate real email delivery here
    */
    return safeJson(res, {
      ok: true,
      success: true,
      message:
        "If an account exists for this email, a reset link will be sent shortly.",
    });
  } catch (e) {
    return safeJson(res, {
      ok: false,
      success: false,
      error: "INTERNAL_ERROR",
      message: "Temporary error. Please try again.",
    });
  }
};
