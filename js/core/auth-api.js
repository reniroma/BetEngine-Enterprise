/*********************************************************
 * BetEngine Enterprise – AUTH API CLIENT (FINAL v1.0)
 * Cookie-based session (HttpOnly) – Same-Origin
 *
 * Base URL:
 *   Frontend: https://www.quantumoddsportal.com
 *   API:      https://www.quantumoddsportal.com/api
 *
 * NOTES:
 * - Uses fetch with credentials: "include" so cookies work.
 * - No CORS required (same-origin).
 * - Provides a normalized error shape for UI/back-end parity.
 *********************************************************/
(() => {
  "use strict";

  const BASE = "/api";
  const DEFAULT_TIMEOUT_MS = 12000;

  class BEApiError extends Error {
    constructor(payload) {
      super(payload?.message || "Request failed");
      this.name = "BEApiError";
      this.status = payload?.status ?? 0;
      this.code = payload?.code || "REQUEST_FAILED";
      this.details = payload?.details ?? null;
      this.requestId = payload?.requestId ?? null;
      this.path = payload?.path ?? null;
      this.method = payload?.method ?? null;
      this.timestamp = payload?.timestamp ?? new Date().toISOString();
    }
  }

  const getCookie = (name) => {
    try {
      const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return m ? decodeURIComponent(m[1]) : "";
    } catch {
      return "";
    }
  };

  const buildHeaders = (extra = {}) => {
    const headers = {
      Accept: "application/json",
      ...extra
    };

    // Optional CSRF pattern (backend may implement later)
    // If backend sets XSRF-TOKEN cookie, we echo it back.
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf && !headers["X-CSRF-Token"]) headers["X-CSRF-Token"] = xsrf;

    // Helpful for backend logs / WAF rules
    if (!headers["X-Requested-With"]) headers["X-Requested-With"] = "XMLHttpRequest";

    return headers;
  };

  const safeJson = async (res) => {
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    try {
      const text = await res.text();
      return text ? { message: text } : null;
    } catch {
      return null;
    }
  };

  const normalizeError = async ({ res, path, method, fallbackCode }) => {
    const body = await safeJson(res);

    const payload = {
      status: res?.status ?? 0,
      code: body?.error?.code || body?.code || fallbackCode || "REQUEST_FAILED",
      message:
        body?.error?.message ||
        body?.message ||
        `HTTP ${res?.status ?? 0} ${res?.statusText || ""}`.trim(),
      details: body?.error?.details || body?.details || null,
      requestId: body?.error?.requestId || body?.requestId || res?.headers?.get("x-request-id") || null,
      path,
      method,
      timestamp: body?.error?.timestamp || body?.timestamp || new Date().toISOString()
    };

    return new BEApiError(payload);
  };

  const request = async (path, options = {}) => {
    const url = `${BASE}${path}`;
    const method = (options.method || "GET").toUpperCase();

    const controller = new AbortController();
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
    const t = setTimeout(() => controller.abort(), timeoutMs);

    const init = {
      method,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      ...options,
      headers: buildHeaders(options.headers || {})
    };

    try {
      const res = await fetch(url, init);

      // Success
      if (res.ok) {
        // 204 No Content
        if (res.status === 204) return { ok: true, status: res.status, data: null };
        const data = await safeJson(res);
        return { ok: true, status: res.status, data };
      }

      // Error
      throw await normalizeError({ res, path, method, fallbackCode: "HTTP_ERROR" });
    } catch (err) {
      // Network / timeout errors
      if (err?.name === "AbortError") {
        throw new BEApiError({
          status: 0,
          code: "TIMEOUT",
          message: "Request timed out",
          details: { timeoutMs },
          path,
          method
        });
      }

      if (err instanceof BEApiError) throw err;

      throw new BEApiError({
        status: 0,
        code: "NETWORK_ERROR",
        message: err?.message || "Network error",
        details: null,
        path,
        method
      });
    } finally {
      clearTimeout(t);
    }
  };

  /* ==================================================
     AUTH ENDPOINTS (Cookie Session)
  ================================================== */

  // GET /api/auth/me
  const me = async () => {
    const r = await request("/auth/me", { method: "GET" });
    return r.data;
  };

 // POST /api/auth/login
// body: { email, password }  (STRICT)
const login = async ({ email, password } = {}) => {
  const e = String(email ?? "").trim();
  const p = String(password ?? "");

  const r = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: e, password: p })
  });
  return r.data;
};

  // POST /api/auth/register
  // body: { username, email, password }
  const register = async ({ username, email, password } = {}) => {
    const r = await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    return r.data;
  };

  // POST /api/auth/logout
  const logout = async () => {
    const r = await request("/auth/logout", { method: "POST" });
    return r.data;
  };

  // POST /api/auth/forgot-password
  // body: { email }
  const forgotPassword = async ({ email } = {}) => {
    const r = await request("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return r.data;
  };

  // POST /api/auth/reset-password
  // body: { token, newPassword }
  const resetPassword = async ({ token, newPassword } = {}) => {
    const r = await request("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    });
    return r.data;
  };

  /* ==================================================
     PUBLIC API (Stable Namespace)
  ================================================== */
  const API = Object.freeze({
    request,
    me,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    BEApiError
  });

  // Backward/forward compatible aliases (auth-service expects BEAuthApi)
  window.BEAuthApi = API;
  window.BEAuthAPI = API;

  console.log("auth-api.js v1.0 READY");
})();
