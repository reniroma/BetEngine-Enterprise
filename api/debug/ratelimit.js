// api/debug/ratelimit.js
import { rateLimit } from "../../backend/api/_rateLimit.js";

function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) {
    return xf.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function normalizeIp(ip) {
  return String(ip).replace(/[^a-zA-Z0-9.:_-]/g, "_");
}

export default async function handler(req, res) {
  try {
    const ip = normalizeIp(getClientIp(req));

    // Stable key: route + IP (no timestamp, no random)
    const key = `debug:ratelimit:${ip}`;

    // Example limits for debug endpoint (adjust freely)
    const limit = 5;
    const windowSeconds = 60;

    const result = await rateLimit({
      key,
      limit,
      window: windowSeconds
    });

    return res.status(200).json({
      ok: true,
      source: "api/debug/ratelimit.js",
      key,
      limit,
      window: windowSeconds,
      result
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      source: "api/debug/ratelimit.js",
      error: "DEBUG_RATE_LIMIT_FAILED",
      message: e?.message || String(e)
    });
  }
}
