/*********************************************************
 * BetEngine Enterprise – AUTH API (STUB)
 * GET /api/auth/me
 *
 * Phase 2 placeholder:
 * - Returns 200 by default (unauthenticated) to avoid console noise
 * - Safe shape for frontend hydrate()
 *********************************************************/
module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  // IMPORTANT: 200 prevents "Failed to load resource" red noise in DevTools
  res.statusCode = 200;

  return res.end(
    JSON.stringify({
      authenticated: false,
      user: null,
      role: "user",
      premium: false
    })
  );
};
