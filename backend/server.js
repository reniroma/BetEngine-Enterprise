/*********************************************************
 * BetEngine Enterprise – BACKEND SERVER (AUTH SKELETON)
 * FIX: Session Rotation + Cookie Hardening (Enterprise Safe)
 *
 * Auth:
 * - Cookie-based session (HttpOnly)
 * - Endpoints:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *********************************************************/

const http = require("http");
const crypto = require("crypto");
const { serialize: serializeCookie, parse: parseCookie } = require("cookie");

const PORT = process.env.PORT || 3001;

/* =========================
   Security headers
========================= */
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
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

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? String(req.socket.remoteAddress) : "0.0.0.0";
}

/* =========================
   Body parsing + limits
========================= */
const MAX_JSON_BODY_BYTES = 16 * 1024;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JSON_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { code: "BODY_TOO_LARGE" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const data = raw ? JSON.parse(raw) : {};
        resolve(data && typeof data === "object" ? data : {});
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { code: "INVALID_JSON" }));
      }
    });

    req.on("error", (e) => reject(e));
  });
}

/* =========================
   Validation
========================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

function validateEmail(email) {
  if (!email) return { ok: false, code: "VALIDATION_ERROR", message: "Email is required" };
  if (email.length > 254) return { ok: false, code: "VALIDATION_ERROR", message: "Email too long" };
  if (!EMAIL_RE.test(email)) return { ok: false, code: "VALIDATION_ERROR", message: "Invalid email format" };
  return { ok: true };
}

function validatePassword(password) {
  if (!password) return { ok: false, code: "VALIDATION_ERROR", message: "Password is required" };
  if (password.length < PASSWORD_MIN) {
    return { ok: false, code: "VALIDATION_ERROR", message: `Password must be at least ${PASSWORD_MIN} characters` };
  }
  if (password.length > PASSWORD_MAX) {
    return { ok: false, code: "VALIDATION_ERROR", message: `Password must be at most ${PASSWORD_MAX} characters` };
  }
  return { ok: true };
}

/* =========================
   PASSWORD HASHING
========================= */
const HASH_ITERATIONS = 100_000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)
    .toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
}

/* =========================
   Rate limiting
========================= */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_LOGIN = 10;
const RATE_LIMIT_REGISTER = 5;

const rateStore = new Map();

function rateKey(req, route) {
  return `${getClientIp(req)}::${route}`;
}

function rateCheck(req, route, limit) {
  const key = rateKey(req, route);
  const now = Date.now();
  const cur = rateStore.get(key);

  if (!cur || now >= cur.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true, remaining: limit - 1, resetAt: now + RATE_WINDOW_MS };
  }

  if (cur.count >= limit) {
    return { ok: false, remaining: 0, resetAt: cur.resetAt };
  }

  cur.count += 1;
  rateStore.set(key, cur);
  return { ok: true, remaining: Math.max(0, limit - cur.count), resetAt: cur.resetAt };
}

function applyRateHeaders(res, check) {
  res.setHeader("X-RateLimit-Remaining", String(check.remaining ?? 0));
  if (check.resetAt) res.setHeader("X-RateLimit-Reset", String(check.resetAt));
}

/* =========================
   TEMP STORES (DB later)
========================= */
const sessions = new Map(); // sessionId -> { user, role, premium, expiresAt }
const users = new Map();    // email -> user

/* =========================
   Session helpers (FIX)
========================= */
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sid, sess] of sessions.entries()) {
    if (!sess || sess.expiresAt <= now) {
      sessions.delete(sid);
    }
  }
}

function createSession(user) {
  cleanupExpiredSessions();

  const sessionId = "sess_" + crypto.randomBytes(16).toString("hex");
  sessions.set(sessionId, {
    user: { id: user.id, email: user.email, username: user.username },
    role: user.role,
    premium: user.premium,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return sessionId;
}

function rotateSession(req, res, user) {
  // Invalidate existing session cookie if present (session fixation protection)
  const cookies = parseCookie(req.headers.cookie || "");
  const oldSid = cookies.be_session;
  if (oldSid && sessions.has(oldSid)) {
    sessions.delete(oldSid);
  }

  const newSid = createSession(user);
  setSessionCookie(req, res, newSid);
  return newSid;
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
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: Math.floor(SESSION_TTL_MS / 1000)
    })
  );
}

function clearSessionCookie(req, res) {
  const secure = isHttps(req);
  res.setHeader(
    "Set-Cookie",
    serializeCookie("be_session", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      expires: new Date(0)
    })
  );
}

/* =========================
   Server
========================= */
const server = http.createServer(async (req, res) => {
  const { method, url, headers } = req;

  if (method === "GET" && url === "/health") {
    return sendJSON(res, 200, { ok: true });
  }

  /* =========================
     AUTH: LOGIN
  ========================= */
  if (method === "POST" && url === "/api/auth/login") {
    const rc = rateCheck(req, "login", RATE_LIMIT_LOGIN);
    applyRateHeaders(res, rc);
    if (!rc.ok) {
      return sendJSON(res, 429, {
        error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." }
      });
    }

    let data = {};
    try {
      data = await readJsonBody(req);
    } catch {
      return sendJSON(res, 400, { error: { code: "INVALID_JSON", message: "Invalid JSON body" } });
    }

    const email = normalizeEmail(data.email);
    const password = typeof data.password === "string" ? data.password : "";

    if (!validateEmail(email).ok || !validatePassword(password).ok) {
      return sendJSON(res, 400, {
        error: { code: "VALIDATION_ERROR", message: "Email and password are required" }
      });
    }

    const user = users.get(email);
    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return sendJSON(res, 401, {
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    const sid = rotateSession(req, res, user);
    const sess = sessions.get(sid);

    return sendJSON(res, 200, {
      authenticated: true,
      user: sess.user,
      role: sess.role,
      premium: sess.premium
    });
  }

  /* =========================
     AUTH: REGISTER
  ========================= */
  if (method === "POST" && url === "/api/auth/register") {
    const rc = rateCheck(req, "register", RATE_LIMIT_REGISTER);
    applyRateHeaders(res, rc);
    if (!rc.ok) {
      return sendJSON(res, 429, {
        error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." }
      });
    }

    let data = {};
    try {
      data = await readJsonBody(req);
    } catch {
      return sendJSON(res, 400, { error: { code: "INVALID_JSON", message: "Invalid JSON body" } });
    }

    const email = normalizeEmail(data.email);
    const password = typeof data.password === "string" ? data.password : "";
    const username =
      typeof data.username === "string" && data.username.trim()
        ? data.username.trim()
        : (email.includes("@") ? email.split("@")[0] : "user");

    if (!validateEmail(email).ok || !validatePassword(password).ok) {
      return sendJSON(res, 400, {
        error: { code: "VALIDATION_ERROR", message: "Invalid registration data" }
      });
    }

    if (users.has(email)) {
      return sendJSON(res, 409, {
        error: { code: "USER_EXISTS", message: "User already exists" }
      });
    }

    const { salt, hash } = hashPassword(password);
    const newUser = {
      id: "u_" + crypto.randomBytes(10).toString("hex"),
      email,
      username,
      passwordSalt: salt,
      passwordHash: hash,
      role: "user",
      premium: false
    };

    users.set(email, newUser);

    const sid = rotateSession(req, res, newUser);
    const sess = sessions.get(sid);

    return sendJSON(res, 201, {
      authenticated: true,
      user: sess.user,
      role: sess.role,
      premium: sess.premium
    });
  }

  /* =========================
     AUTH: ME
  ========================= */
  if (method === "GET" && url === "/api/auth/me") {
    cleanupExpiredSessions();

    const cookies = parseCookie(headers.cookie || "");
    const sid = cookies.be_session;

    if (!sid || !sessions.has(sid)) {
      return sendJSON(res, 200, {
        authenticated: false,
        user: null,
        role: "user",
        premium: false
      });
    }

    const sess = sessions.get(sid);
    return sendJSON(res, 200, {
      authenticated: true,
      user: sess.user,
      role: sess.role,
      premium: sess.premium
    });
  }

  /* =========================
     AUTH: LOGOUT
  ========================= */
  if (method === "POST" && url === "/api/auth/logout") {
    const cookies = parseCookie(headers.cookie || "");
    const sid = cookies.be_session;

    if (sid && sessions.has(sid)) {
      sessions.delete(sid);
    }

    clearSessionCookie(req, res);
    return sendJSON(res, 200, { ok: true });
  }

  return notFound(res);
});

/* =========================
   Listen
========================= */
server.listen(PORT, () => {
  console.log(`BetEngine backend running on http://localhost:${PORT}`);
});
