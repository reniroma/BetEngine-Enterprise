/*********************************************************
 * BetEngine Enterprise – BACKEND SERVER (SKELETON)
 * Node.js http server (NO Express)
 *
 * Auth:
 * - Cookie-based session (HttpOnly)
 * - Endpoints:
 *   POST /api/auth/login
 *   (GET /api/auth/me comes next step)
 *********************************************************/

const http = require("http");
const { serialize: serializeCookie } = require("cookie");

const PORT = process.env.PORT || 3001;

/* =========================
   Helpers
========================= */
function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function notFound(res) {
  return sendJSON(res, 404, {
    error: { code: "NOT_FOUND", message: "Endpoint not found" }
  });
}

/* =========================
   Server
========================= */
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  /* =========================
     Health check
  ========================= */
  if (method === "GET" && url === "/health") {
    return sendJSON(res, 200, { ok: true });
  }

  /* =====================================================
     AUTH: LOGIN (REAL IMPLEMENTATION)
     POST /api/auth/login
  ===================================================== */
  if (method === "POST" && url === "/api/auth/login") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });

    req.on("end", () => {
      let data = {};
      try {
        data = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, {
          error: { code: "INVALID_JSON", message: "Invalid JSON body" }
        });
      }

      const email =
        typeof data.email === "string" ? data.email.trim() : "";
      const password =
        typeof data.password === "string" ? data.password : "";

      if (!email || !password) {
        return sendJSON(res, 400, {
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and password are required"
          }
        });
      }

      // TEMP USER (DB comes later)
      if (email !== "test@betengine.dev" || password !== "test123") {
        return sendJSON(res, 401, {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password"
          }
        });
      }

      // Create session cookie
      const sessionId = "sess_" + Date.now();

      const cookie = serializeCookie("be_session", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      });

      res.setHeader("Set-Cookie", cookie);

      return sendJSON(res, 200, {
        authenticated: true,
        user: {
          id: "u-1",
          email,
          username: email.split("@")[0]
        },
        role: "user",
        premium: false
      });
    });

    return;
  }

  /* =========================
     Fallback
  ========================= */
  return notFound(res);
});

/* =========================
   Listen
========================= */
server.listen(PORT, () => {
  console.log(
    `BetEngine backend running on http://localhost:${PORT}`
  );
});
