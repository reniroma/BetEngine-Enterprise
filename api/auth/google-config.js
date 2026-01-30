// api/auth/google-config.js
/*********************************************************

BetEngine Enterprise – AUTH API (GOOGLE CONFIG) – v1.0

GET /api/auth/google-config

Purpose:

Returns the public Google OAuth client id required by the browser.


Does NOT expose any secrets.
*********************************************************/



function sendJson(res, status, payload) {
res.statusCode = status;
res.setHeader("Content-Type", "application/json; charset=utf-8");
res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
try {
if (req.method !== "GET") {
res.setHeader("Allow", "GET");
return sendJson(res, 405, { ok: false, error: { code: "METHOD_NOT_ALLOWED" } });
}

const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();    

if (!clientId) {    
  return sendJson(res, 501, {    
    ok: false,    
    error: { code: "GOOGLE_NOT_CONFIGURED", message: "Google login is not configured yet." }    
  });    
}    

return sendJson(res, 200, { ok: true, clientId });

} catch {
return sendJson(res, 500, { ok: false, error: { code: "SERVER_ERROR" } });
}
}
