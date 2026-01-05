// db.js — ES MODULE VERSION
// SQLite persistence layer (users + sessions + reset tokens)

import Database from "better-sqlite3";
import crypto from "crypto";

const db = new Database("betengine.sqlite");

/* ==============================
   INIT (AUTHORITATIVE SCHEMA)
============================== */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
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

/* =========================
   USERS
========================= */
function getUserByEmail(email) {
  return db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email) || null;
}

function getUserByUsername(username) {
  return db
    .prepare(`SELECT * FROM users WHERE username = ?`)
    .get(username) || null;
}

function createUser(email, username, passwordHash, passwordSalt) {
  const stmt = db.prepare(`
    INSERT INTO users (email, username, password_hash, password_salt, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    email,
    username,
    passwordHash,
    passwordSalt,
    Date.now()
  );

  return info.lastInsertRowid;
}

function updateUserPasswordById(userId, newHash, newSalt) {
  db.prepare(
    `UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?`
  ).run(newHash, newSalt, userId);
}

/* =========================
   SESSIONS
========================= */
function createSession(id, userId, expiresAt) {
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at)
     VALUES (?, ?, ?)`
  ).run(id, userId, expiresAt);
}

function getSession(id) {
  return db.prepare(
    `SELECT s.id, s.expires_at, u.id AS user_id, u.email, u.username
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`
  ).get(id) || null;
}

function deleteSession(id) {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(id);
}

function deleteAllSessionsForUser(userId) {
  db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId);
}

function refreshSessionExpiry(id, newExpiry) {
  db.prepare(
    `UPDATE sessions SET expires_at = ? WHERE id = ?`
  ).run(newExpiry, id);
}

function cleanupExpiredSessions(now = Date.now()) {
  db.prepare(
    `DELETE FROM sessions WHERE expires_at < ?`
  ).run(now);
}

/* =========================
   RESET TOKENS
========================= */
function createPasswordResetToken({ userId, selector, verifierHash, expiresAt }) {
  db.prepare(`
    INSERT INTO password_reset_tokens
    (selector, verifier_hash, user_id, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(selector, verifierHash, userId, expiresAt);
}

function getPasswordResetTokenBySelector(selector) {
  return db.prepare(
    `SELECT prt.*, u.email
     FROM password_reset_tokens prt
     JOIN users u ON u.id = prt.user_id
     WHERE prt.selector = ?`
  ).get(selector) || null;
}

function consumePasswordResetToken(selector) {
  db.prepare(
    `DELETE FROM password_reset_tokens WHERE selector = ?`
  ).run(selector);
}

/* =========================
   EXPORTS
========================= */
export {
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUserPasswordById,

  createSession,
  getSession,
  deleteSession,
  deleteAllSessionsForUser,
  refreshSessionExpiry,
  cleanupExpiredSessions,

  createPasswordResetToken,
  getPasswordResetTokenBySelector,
  consumePasswordResetToken
};
