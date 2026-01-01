/*********************************************************
 * BetEngine Enterprise – SQLITE DB LAYER (v1.0)
 * Persistent storage for users & sessions
 *
 * Tables:
 * - users
 * - sessions
 *
 * SAFE:
 * - Prepared statements
 * - No ORM magic
 *********************************************************/

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "betengine.sqlite");

// Single DB instance
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("[DB] Failed to connect:", err.message);
    process.exit(1);
  }
  console.log("[DB] SQLite connected:", DB_PATH);
});

/* =========================
   INIT SCHEMA
========================= */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      premium INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

/* =========================
   USER QUERIES
========================= */
function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function createUser(user) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO users
      (id, email, username, password_salt, password_hash, role, premium, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user.id,
        user.email,
        user.username,
        user.passwordSalt,
        user.passwordHash,
        user.role,
        user.premium ? 1 : 0,
        Date.now()
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

/* =========================
   SESSION QUERIES
========================= */
function createSession(session) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO sessions
      (session_id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
      `,
      [
        session.sessionId,
        session.userId,
        session.expiresAt,
        Date.now()
      ],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function getSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT s.session_id, s.expires_at,
             u.id, u.email, u.username, u.role, u.premium
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.session_id = ?
      `,
      [sessionId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function deleteSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM sessions WHERE session_id = ?`,
      [sessionId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function cleanupExpiredSessions() {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM sessions WHERE expires_at <= ?`,
      [Date.now()],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

/* =========================
   EXPORT
========================= */
module.exports = {
  db,
  getUserByEmail,
  createUser,
  createSession,
  getSession,
  deleteSession,
  cleanupExpiredSessions
};
