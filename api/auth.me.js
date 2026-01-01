/*********************************************************
 * BetEngine Enterprise – AUTH API (STUB)
 * GET /api/auth/me
 *
 * Phase 2 placeholder:
 * - Returns 401 by default (unauthenticated)
 * - Safe shape for frontend hydrate()
 *********************************************************/
module.exports = (req, res) => {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = 401;

  return res.end(
    JSON.stringify({
      authenticated: false,
      user: null,
      role: "user",
      premium: false
    })
  );
};
