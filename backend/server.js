/*********************************************************
 * BetEngine Backend – Minimal HTTP Server (Skeleton)
 * Purpose:
 * - Provide real API endpoints for auth
 * - Cookie-based session (HttpOnly)
 * - No framework, no magic
 *********************************************************/

import http from "http";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";

const PORT = process.env.PORT || 3001;

/* =========================
   Helpers
========================= */
const sendJSON = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
};

const notFound = (res) => {
  sendJSON(res, 404, { error: "NOT_FOUND" });
};

/* =========================
   Server
========================= */
const server = http.createServer(async (req, res) => {
  const { method, url, headers } = req;

  // Basic routing placeholder
  if (method === "GET" && url === "/health") {
    return sendJSON(res, 200, { ok: true });
  }

  // Placeholder for /api/auth/*
  if (url.startsWith("/api/auth")) {
    return sendJSON(res, 501, { error: "AUTH_NOT_IMPLEMENTED" });
  }

  return notFound(res);
});

server.listen(PORT, () => {
  console.log(`BetEngine backend running on http://localhost:${PORT}`);
});
