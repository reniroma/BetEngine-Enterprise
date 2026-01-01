/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGIN STUB)
 * POST /api/auth/login
 *
 * Vercel Serverless Function (Node)
 * Sets HttpOnly cookie session (stub)
 *********************************************************/
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  // Parse JSON body (safe for Vercel node)
  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf8");
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Minimal validation (stub)
  if (!email || !password) {
    res.statusCode = 400;
    return res.end(
      JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "Email and password are required",
          details: { fields: ["email", "password"] }
        }
      })
    );
  }

  // STUB session value (replace later with real session/JWT id on server)
  const sessionValue = "stub-session";

  // Secure should be true on https production, but keep safe fallback
  const isHttps = (req.headers["x-forwarded-proto"] || "").includes("https");
  const cookieParts = [
    `be_session=${encodeURIComponent(sessionValue)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : null
  ].filter(Boolean);

  res.setHeader("Set-Cookie", cookieParts.join("; "));

  res.statusCode = 200;
  return res.end(
    JSON.stringify({
      authenticated: true,
      user: {
        id: "stub-1",
        username: email.includes("@") ? email.split("@")[0] : "user",
        email
      },
      role: "user",
      premium: false
    })
  );
};
