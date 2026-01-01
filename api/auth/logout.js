/*********************************************************
 * BetEngine Enterprise – AUTH API (LOGOUT STUB)
 * POST /api/auth/logout
 *
 * Vercel Serverless Function (Node)
 * Clears HttpOnly cookie session
 *********************************************************/
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  const isHttps = (req.headers["x-forwarded-proto"] || "").includes("https");

  const cookieParts = [
    "be_session=",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    isHttps ? "Secure" : null
  ].filter(Boolean);

  res.setHeader("Set-Cookie", cookieParts.join("; "));

  res.statusCode = 200;
  return res.end(
    JSON.stringify({
      ok: true
    })
  );
};
