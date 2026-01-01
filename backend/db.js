/*********************************************************
 * BetEngine Enterprise – DB LAYER (SQLite)
 * Sessions + Users + Password Reset Tokens (Enterprise Safe)
 *
 * This file assumes you already installed SQLite dep earlier.
 * Uses better-sqlite3 for deterministic behavior.
 *********************************************************/

const fs = require("fs");
const path = require("path");

// IMPORTANT: if you use a different sqlite library already, tell me,
// and I will adapt db.js to match it exactly.
const Database = require("better-sqlite3");

const DB_PATH =
  process.env.SQLITE_PATH ||
  path.join(process.cwd(), "data", "betengine.sqlite");

const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

/* =========================
   Schema
========================= */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  premium INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  selector TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  verifier_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON password_reset_tokens(expires_at);
`);

/* =========================
   User queries
========================= */
function getUserByEmail(email) {
  const row = db
    .prepare(
      `SELECT id, email, username, password_salt, password_hash, role, premium
       FROM users
       WHERE email = ?`
    )
    .get(email);

  return row || null;
}

function createUser({ email, username, passwordSalt, passwordHash }) {
  const now = Date.now();
  const id = "u_" + require("crypto").randomBytes(10).toString("hex");

  db.prepare(
    `INSERT INTO users (id, email, username, password_salt, password_hash, role, premium, created_at)
     VALUES (?, ?, ?, ?, ?, 'user', 0, ?)`
  ).run(id, email, username, passwordSalt, passwordHash, now);

  return getUserByEmail(email);
}

function updateUserPasswordById(userId, { passwordSalt, passwordHash }) {
  db.prepare(
    `UPDATE users
     SET password_salt = ?, password_hash = ?
     WHERE id = ?`
  ).run(passwordSalt, passwordHash, userId);
}

/* =========================
   Sessions
========================= */
function createSession({ sessionId, userId, expiresAt }) {
  const now = Date.now();
  db.prepare(
    `INSERT INTO sessions (session_id, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(sessionId, userId, expiresAt, now);
}

function deleteSession(sessionId) {
  db.prepare(`DELETE FROM sessions WHERE session_id = ?`).run(sessionId);
}

function deleteAllSessionsForUser(userId) {
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
}

function refreshSessionExpiry(sessionId, newExpiresAt) {
  db.prepare(
    `UPDATE sessions
     SET expires_at = ?
     WHERE session_id = ?`
  ).run(newExpiresAt, sessionId);
}

function cleanupExpiredSessions() {
  const now = Date.now();
  db.prepare(`DELETE FROM sessions WHERE expires_at <= ?`).run(now);
  // Also cleanup expired reset tokens
  db.prepare(`DELETE FROM password_reset_tokens WHERE expires_at <= ?`).run(now);
}

function getSession(sessionId) {
  const now = Date.now();

  // Join session -> user
  const row = db.prepare(
    `SELECT
       u.id as id,
       u.email as email,
       u.username as username,
       u.role as role,
       u.premium as premium,
       s.session_id as session_id,
       s.expires_at as expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_id = ?`
  ).get(sessionId);

  if (!row) return null;

  // Expired -> delete and return null
  if (Number(row.expires_at) <= now) {
    deleteSession(sessionId);
    return null;
  }

  return row;
}

/* =========================
   Password reset tokens
========================= */
function createPasswordResetToken({ userId, selector, verifierHash, expiresAt }) {
  const now = Date.now();

  // One active token per user (safe + simple)
  db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).run(userId);

  db.prepare(
    `INSERT INTO password_reset_tokens (selector, user_id, verifier_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(selector, userId, verifierHash, expiresAt, now);
}

function getPasswordResetTokenBySelector(selector) {
  const row = db.prepare(
    `SELECT
       prt.selector as selector,
       prt.user_id as user_id,
       prt.verifier_hash as verifier_hash,
       prt.expires_at as expires_at,
       u.email as email
     FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.selector = ?`
  ).get(selector);

  return row || null;
}

function consumePasswordResetToken(selector) {
  db.prepare(`DELETE FROM password_reset_tokens WHERE selector = ?`).run(selector);
}

/* =========================
   Exports
========================= */
module.exports = {
  // users
  getUserByEmail,
  createUser,
  updateUserPasswordById,

  // sessions
  createSession,
  getSession,
  deleteSession,
  deleteAllSessionsForUser,
  refreshSessionExpiry,
  cleanupExpiredSessions,

  // reset tokens
  createPasswordResetToken,
  getPasswordResetTokenBySelector,
  consumePasswordResetToken
};
