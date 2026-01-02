/*********************************************************
 * BetEngine Enterprise – BACKEND SERVER (AUTH)
 * SQLite-backed + SESSION HARDENED + ACCOUNT LIFECYCLE
 *
 * Endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *
 * Account lifecycle:
 *   POST /api/auth/change-password
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   POST /api/auth/logout-all
 *********************************************************/

import http from "http";
import crypto from "crypto";
import { serialize as serializeCookie, parse as parseCookie } from "cookie";

import {
  getUserByEmail,
  createUser,
  createSession,
  getSession,
  deleteSession,
  deleteAllSessionsForUser,
  cleanupExpiredSessions,
  refreshSessionExpiry,
  updateUserPasswordById,
  createPasswordResetToken,
  getPasswordResetTokenBySelector,
  consumePasswordResetToken
} from "./db.js";

const PORT = process.env.PORT || 3001;

/* =========================
   SESSION CONFIG (SINGLE SOURCE)
========================= */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/* =========================
   RESET TOKEN CONFIG
========================= */
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RESET_TOKEN_BYTES = 32; // 256-bit

/* =========================
   Security headers
========================= */
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
}

/* =========================
   Helpers
========================= */
function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  setSecurityHeaders(res);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function notFound(res) {
  return sendJSON(res, 404, {
    error: { code: "NOT_FOUND", message: "Endpoint not found" }
  });
}

function isHttps(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "").toLowerCase();
  return proto.includes("https");
}

/* =========================
   Body parsing
========================= */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { code: "INVALID_JSON" }));
      }
    });
  });
}

/* =========================
   Validation
========================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function validateEmail(e) {
  return !!(e && EMAIL_RE.test(e) && e.length <= 254);
}

function validatePassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 128;
}

/* =========================
   Password hashing
========================= */
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

/* =========================
   Cookie helpers (HARDENED)
========================= */
function setSessionCookie(req, res, sessionId) {
  const secure = isHttps(req);

  res.setHeader(
    "Set-Cookie",
    serializeCookie("be_session", sessionId, {
      httpOnly: true,
      sameSite: secure ? "strict" : "lax",
      secure,
      path: "/",
      maxAge: SESSION_TTL_MS / 1000
    })
  );
}

function clearSessionCookie(req, res) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie("be_session", "", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      expires: new Date(0)
    })
  );
}

/* =========================
   Session auth helper
========================= */
async function requireSession(req) {
  const cookies = parseCookie(req.headers.cookie || "");
  const sessionId = cookies.be_session;
  if (!sessionId) return null;

  const sess = await getSession(sessionId);
  if (!sess) return null;

  return { sessionId, sess };
}

/* =========================
   Reset token helpers (selector + verifier)
   Stored in DB as:
     selector (public id)
     verifier_hash (sha256 hex of verifier)
========================= */
function sha256Hex(input) {
  return crypto.createHash("sha256").update(String(input), "utf8").digest("hex");
}

function makeResetToken() {
  const selector = crypto.randomBytes(16).toString("hex"); // public
  const verifier = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex"); // secret
  const verifierHash = sha256Hex(verifier);
  // Token sent to user (single string)
  const token = `${selector}.${verifier}`;
  return { selector, verifier, verifierHash, token };
}

/* =========================
   Server
========================= */
const server = http.createServer(async (req, res) => {
  const { method, url, headers } = req;

  /* =========================
     LOGIN
  ========================= */
  if (method === "POST" && url === "/api/auth/login") {
    const data = await readJsonBody(req).catch(() => null);
    if (!data) return sendJSON(res, 400, { error: { code: "INVALID_JSON" } });

    const email = normalizeEmail(data.email);
    const password = data.password;

    if (!validateEmail(email) || !validatePassword(password)) {
      return sendJSON(res, 400, { error: { code: "VALIDATION_ERROR" } });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return sendJSON(res, 401, { error: { code: "INVALID_CREDENTIALS" } });
    }

    if (!verifyPassword(password, user.password_salt, user.password_hash)) {
      return sendJSON(res, 401, { error: { code: "INVALID_CREDENTIALS" } });
    }

    const sessionId = "sess_" + crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + SESSION_TTL_MS;

    await createSession({ sessionId, userId: user.id, expiresAt });
    setSessionCookie(req, res, sessionId);

    return sendJSON(res, 200, {
      authenticated: true,
      user: { id: user.id, email: user.email, username: user.username },
      role: user.role,
      premium: !!user.premium
    });
  }

  /* =========================
     REGISTER (kept as-is)
  ========================= */
  if (method === "POST" && url === "/api/auth/register") {
    const data = await readJsonBody(req).catch(() => null);
    if (!data) return sendJSON(res, 400, { error: { code: "INVALID_JSON" } });

    const email = normalizeEmail(data.email);
    const password = data.password;
    const username =
      typeof data.username === "string" && data.username.trim()
        ? data.username.trim()
        : (email.includes("@") ? email.split("@")[0] : "user");

    if (!validateEmail(email) || !validatePassword(password)) {
      return sendJSON(res, 400, { error: { code: "VALIDATION_ERROR" } });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return sendJSON(res, 409, { error: { code: "USER_EXISTS" } });
    }

    const { salt, hash } = hashPassword(password);
    const user = await createUser({
      email,
      username,
      passwordSalt: salt,
      passwordHash: hash
    });

    const sessionId = "sess_" + crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + SESSION_TTL_MS;

    await createSession({ sessionId, userId: user.id, expiresAt });
    setSessionCookie(req, res, sessionId);

    return sendJSON(res, 201, {
      authenticated: true,
      user: { id: user.id, email: user.email, username: user.username },
      role: user.role,
      premium: !!user.premium
    });
  }

  /* =========================
     ME (SLIDING SESSION)
  ========================= */
  if (method === "GET" && url === "/api/auth/me") {
    const cookies = parseCookie(headers.cookie || "");
    const sessionId = cookies.be_session;

    if (!sessionId) {
      return sendJSON(res, 200, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false
      });
    }

    const sess = await getSession(sessionId);
    if (!sess) {
      return sendJSON(res, 200, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false
      });
    }

    // Sliding expiration
    await refreshSessionExpiry(sessionId, Date.now() + SESSION_TTL_MS);
    setSessionCookie(req, res, sessionId);

    return sendJSON(res, 200, {
      authenticated: true,
      user: { id: sess.id, email: sess.email, username: sess.username },
      role: sess.role,
      premium: !!sess.premium
    });
  }

  /* =========================
     LOGOUT (single session)
  ========================= */
  if (method === "POST" && url === "/api/auth/logout") {
    const cookies = parseCookie(headers.cookie || "");
    const sessionId = cookies.be_session;

    if (sessionId) await deleteSession(sessionId);
    clearSessionCookie(req, res);

    return sendJSON(res, 200, { ok: true });
  }

  /* =====================================================
     ACCOUNT LIFECYCLE
  ===================================================== */

  /* =========================
     CHANGE PASSWORD (requires session)
     body: { oldPassword, newPassword }
     - verifies old password
     - updates hash
     - revokes ALL sessions (including current)
     - creates new session (keeps user logged-in)
  ========================= */
  if (method === "POST" && url === "/api/auth/change-password") {
    const auth = await requireSession(req);
    if (!auth) {
      return sendJSON(res, 401, { error: { code: "UNAUTHORIZED" } });
    }

    const data = await readJsonBody(req).catch(() => null);
    if (!data) return sendJSON(res, 400, { error: { code: "INVALID_JSON" } });

    const oldPassword = typeof data.oldPassword === "string" ? data.oldPassword : "";
    const newPassword = typeof data.newPassword === "string" ? data.newPassword : "";

    if (!validatePassword(oldPassword) || !validatePassword(newPassword)) {
      return sendJSON(res, 400, { error: { code: "VALIDATION_ERROR" } });
    }

    // Load current user from session snapshot
    const currentEmail = auth.sess.email;
    const user = await getUserByEmail(currentEmail);
    if (!user) {
      clearSessionCookie(req, res);
      return sendJSON(res, 401, { error: { code: "UNAUTHORIZED" } });
    }

    if (!verifyPassword(oldPassword, user.password_salt, user.password_hash)) {
      return sendJSON(res, 401, { error: { code: "INVALID_CREDENTIALS" } });
    }

    const { salt, hash } = hashPassword(newPassword);
    await updateUserPasswordById(user.id, { passwordSalt: salt, passwordHash: hash });

    // Revoke all sessions, then create a fresh one
    await deleteAllSessionsForUser(user.id);

    const newSessionId = "sess_" + crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await createSession({ sessionId: newSessionId, userId: user.id, expiresAt });
    setSessionCookie(req, res, newSessionId);

    return sendJSON(res, 200, {
      authenticated: true,
      user: { id: user.id, email: user.email, username: user.username },
      role: user.role,
      premium: !!user.premium
    });
  }

  /* =========================
     FORGOT PASSWORD
     body: { email }
     - never reveals if user exists
     - creates reset token (selector.verifier)
     - logs token to server console (dev-mode)
  ========================= */
  if (method === "POST" && url === "/api/auth/forgot-password") {
    const data = await readJsonBody(req).catch(() => null);
    if (!data) return sendJSON(res, 400, { error: { code: "INVALID_JSON" } });

    const email = normalizeEmail(data.email);

    // Always return OK (no enumeration)
    if (!validateEmail(email)) {
      return sendJSON(res, 200, { ok: true });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return sendJSON(res, 200, { ok: true });
    }

    const { selector, verifierHash, token } = makeResetToken();
    const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

    await createPasswordResetToken({
      userId: user.id,
      selector,
      verifierHash,
      expiresAt
    });

    // DEV: replace later with real email delivery
    console.log(`[RESET TOKEN][DEV] email=${email} token=${token}`);

    return sendJSON(res, 200, { ok: true });
  }

  /* =========================
     RESET PASSWORD
     body: { token, newPassword }
     - token format: selector.verifier
     - verifies verifier hash
     - updates password
     - consumes token
     - revokes ALL sessions
     - creates NEW session (auto-login)
  ========================= */
  if (method === "POST" && url === "/api/auth/reset-password") {
    const data = await readJsonBody(req).catch(() => null);
    if (!data) return sendJSON(res, 400, { error: { code: "INVALID_JSON" } });

    const token = typeof data.token === "string" ? data.token.trim() : "";
    const newPassword = typeof data.newPassword === "string" ? data.newPassword : "";

    if (!token || !validatePassword(newPassword)) {
      return sendJSON(res, 400, { error: { code: "VALIDATION_ERROR" } });
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return sendJSON(res, 400, { error: { code: "INVALID_TOKEN" } });
    }

    const selector = parts[0];
    const verifier = parts[1];
    const verifierHash = sha256Hex(verifier);

    const row = await getPasswordResetTokenBySelector(selector);
    if (!row) {
      return sendJSON(res, 400, { error: { code: "INVALID_TOKEN" } });
    }

    if (Date.now() > row.expires_at) {
      await consumePasswordResetToken(selector);
      return sendJSON(res, 400, { error: { code: "TOKEN_EXPIRED" } });
    }

    // Timing safe compare
    const ok = crypto.timingSafeEqual(
      Buffer.from(String(row.verifier_hash), "hex"),
      Buffer.from(String(verifierHash), "hex")
    );

    if (!ok) {
      return sendJSON(res, 400, { error: { code: "INVALID_TOKEN" } });
    }

    const user = await getUserByEmail(row.email);
    if (!user) {
      await consumePasswordResetToken(selector);
      return sendJSON(res, 400, { error: { code: "INVALID_TOKEN" } });
    }

    const { salt, hash } = hashPassword(newPassword);
    await updateUserPasswordById(user.id, { passwordSalt: salt, passwordHash: hash });
    await consumePasswordResetToken(selector);

    // Revoke all sessions, then create a fresh one (auto-login)
    await deleteAllSessionsForUser(user.id);

    const newSessionId = "sess_" + crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await createSession({ sessionId: newSessionId, userId: user.id, expiresAt });
    setSessionCookie(req, res, newSessionId);

    return sendJSON(res, 200, {
      authenticated: true,
      user: { id: user.id, email: user.email, username: user.username },
      role: user.role,
      premium: !!user.premium
    });
  }

  /* =========================
     LOGOUT ALL (revoke all sessions)
     - requires session
     - deletes all sessions for user
     - clears cookie
  ========================= */
  if (method === "POST" && url === "/api/auth/logout-all") {
    const auth = await requireSession(req);
    if (!auth) {
      clearSessionCookie(req, res);
      return sendJSON(res, 200, { ok: true });
    }

    const userEmail = auth.sess.email;
    const user = await getUserByEmail(userEmail);
    if (user) {
      await deleteAllSessionsForUser(user.id);
    }

    clearSessionCookie(req, res);
    return sendJSON(res, 200, { ok: true });
  }

  return notFound(res);
});

/* =========================
   SESSION CLEANUP JOB
========================= */
setInterval(() => {
  cleanupExpiredSessions().catch(() => {});
}, SESSION_CLEANUP_INTERVAL_MS);

/* =========================
   Listen
========================= */
server.listen(PORT, () => {
  console.log(`BetEngine backend running on http://localhost:${PORT}`);
});
