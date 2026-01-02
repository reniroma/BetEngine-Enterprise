// db.js — ES MODULE VERSION
// SQLite persistence layer (sessions + users + reset tokens)

import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("betengine.sqlite");

// ==============================
// INIT
// ==============================
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  selector TEXT PRIMARY KEY,
  verifier_hash TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// ==============================
// USERS
// ==============================
function getUserByEmail(email) {
  return db.prepare(
    `SELECT * FROM users WHERE email = ?`
  ).get(email) || null;
}

function createUser(email, passwordHash) {
  const stmt = db.prepare(`
    INSERT INTO users (email, password_hash, created_at)
    VALUES (?, ?, ?)
  `);

const info = stmt.run(
    email,
    passwordHash,
    Date.now()
  );

  return info.lastInsertRowid;
}

function updateUserPasswordById(userId, newHash) {
  db.prepare(
    `UPDATE users SET password_hash = ? WHERE id = ?`
  ).run(newHash, userId);
}

// ==============================
// SESSIONS
// ==============================
function createSession(id, userId, expiresAt) {
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES (?, ?, ?)`
  ).run(id, userId, expiresAt);
}

function getSession(id) {
  return db.prepare(
    `SELECT * FROM sessions WHERE id = ?`
  ).get(id) || null;
}

function deleteSession(id) {
  db.prepare(
    `DELETE FROM sessions WHERE id = ?`
  ).run(id);
}

function deleteAllSessionsForUser(userId) {
  db.prepare(
    `DELETE FROM sessions WHERE user_id = ?`
  ).run(userId);
}

function refreshSessionExpiry(id, newExpiry) {
  db.prepare(
    `UPDATE sessions SET expires_at = ? WHERE id = ?`
  ).run(newExpiry, id);
}

function cleanupExpiredSessions(now) {
  db.prepare(
    `DELETE FROM sessions WHERE expires_at < ?`
  ).run(now);
}

// ==============================
// RESET TOKENS
// ==============================
function createPasswordResetToken(userId, ttlMs) {
  const selector = crypto.randomBytes(16).toString("hex");
  const verifier = crypto.randomBytes(32);
  const verifierHash = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("hex");

  db.prepare(
    `INSERT INTO password_reset_tokens
     (selector, verifier_hash, user_id, expires_at)
     VALUES (?, ?, ?, ?)`
  ).run(selector, verifierHash, userId, Date.now() + ttlMs);

  return {
    selector,
    verifier: verifier.toString("hex")
  };
}

function getPasswordResetTokenBySelector(selector) {
  return db.prepare(
    `SELECT * FROM password_reset_tokens WHERE selector = ?`
  ).get(selector) || null;
}

function consumePasswordResetToken(selector) {
  db.prepare(
    `DELETE FROM password_reset_tokens WHERE selector = ?`
  ).run(selector);
}

// ==============================
// EXPORTS (ESM)
// ==============================
export {
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

  // reset_toggle
  createPasswordResetToken,
  getPasswordResetTokenBySelector,
  consumePasswordResetToken
};
