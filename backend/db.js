// db.js — ES MODULE VERSION
// SQLite persistence layer (sessions + users + reset tokens)

import Database from "better-sqlite3";

const db = new Database("betengine.sqlite");

// ==============================
// INIT
// ==============================
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  premium INTEGER NOT NULL DEFAULT 0,
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

// =========================
// USERS
// =========================
function getUserByEmail(email) {
  return (
    db.prepare(
      `SELECT id, email, username, password_salt, password_hash, role, premium
       FROM users WHERE email = ?`
    ).get(email) || null
  );
}

function createUser(email, passwordHash, passwordSalt = "") {
  const stmt = db.prepare(`
    INSERT INTO users (email, password_salt, password_hash, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(
    email,
    passwordSalt,
    passwordHash,
    Date.now()
  );

  return info.lastInsertRowid;
}

function updateUserPasswordById(userId, newHash) {
  db.prepare(
    `UPDATE users
     SET password_hash = ?
     WHERE id = ?`
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
  return (
    db.prepare(
      `SELECT
         s.id,
         s.expires_at,
         u.id   AS user_id,
         u.email,
         u.username,
         u.role,
         u.premium
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    ).get(id) || null
  );
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

function cleanupExpiredSessions() {
  db.prepare(
    `DELETE FROM sessions WHERE expires_at < ?`
  ).run(Date.now());
}

// ==============================
// RESET TOKENS
// ==============================
function createPasswordResetToken({ userId, selector, verifierHash, expiresAt }) {
  db.prepare(
    `INSERT INTO password_reset_tokens
     (selector, verifier_hash, user_id, expires_at)
     VALUES (?, ?, ?, ?)`
  ).run(selector, verifierHash, userId, expiresAt);
}

function getPasswordResetTokenBySelector(selector) {
  return (
    db.prepare(
      `SELECT
         pr.selector,
         pr.verifier_hash,
         pr.expires_at,
         u.email
       FROM password_reset_tokens pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.selector = ?`
    ).get(selector) || null
  );
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

  // reset tokens
  createPasswordResetToken,
  getPasswordResetTokenBySelector,
  consumePasswordResetToken
};
