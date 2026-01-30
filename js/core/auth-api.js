/*********************************************************
 * BetEngine Enterprise – AUTH API CLIENT (FINAL v1.1)
 * Cookie-based session (HttpOnly) – Same-Origin
 *
 * NOTES
 * - Uses fetch with credentials: "include" so cookies work.
 * - Provides a normalized error shape for UI/back-end parity.
 * - Adds STRICT client-side validation to prevent 400 on empty payloads.
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
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf && !headers["X-CSRF-Token"]) headers["X-CSRF-Token"] = xsrf;

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

    const status = res?.status ?? 0;

    const code =
      body?.error?.code ||
      body?.code ||
      fallbackCode ||
      "REQUEST_FAILED";

    const message =
      body?.error?.message ||
      body?.message ||
      `HTTP ${status} ${res?.statusText || ""}`.trim();

    // Preserve server details, but ensure UI always has details.field when possible
    const rawDetails = body?.error?.details ?? body?.details ?? null;

    const clonedDetails =
      rawDetails && typeof rawDetails === "object" && !Array.isArray(rawDetails)
        ? { ...rawDetails }
        : rawDetails;

    const inferredField = (() => {
      if (clonedDetails && typeof clonedDetails === "object" && clonedDetails.field) {
        return String(clonedDetails.field);
      }
      const msg = String(message || "");
      if (/email/i.test(msg)) return "email";
      if (/username/i.test(msg)) return "username";
      return "";
    })();

    const details =
      inferredField
        ? (clonedDetails && typeof clonedDetails === "object" && !Array.isArray(clonedDetails)
            ? { ...clonedDetails, field: clonedDetails.field || inferredField }
            : { field: inferredField })
        : clonedDetails;

    const payload = {
      status,
      code,
      message,
      details,
      requestId:
        body?.error?.requestId ||
        body?.requestId ||
        res?.headers?.get("x-request-id") ||
        null,
      path,
      method,
      timestamp: body?.error?.timestamp || body?.timestamp || new Date().toISOString()
    };

    return new BEApiError(payload);
  };

  const throwValidation = (path, method, message, details) => {
    throw new BEApiError({
      status: 400,
      code: "VALIDATION_ERROR",
      message,
      details: details || null,
      path,
      method,
      timestamp: new Date().toISOString()
    });
  };

  const request = async (path, options = {}) => {
    const url = `${BASE}${path}`;
    const method = String(options.method || "GET").toUpperCase();

    const controller = new AbortController();
    const timeoutMs = Number.isFinite(options.timeoutMs)
      ? options.timeoutMs
      : DEFAULT_TIMEOUT_MS;

    const t = setTimeout(() => controller.abort(), timeoutMs);

    // Avoid leaking non-fetch option keys into init
    const { timeoutMs: _timeoutMs, ...fetchOptions } = options;

    const init = {
      method,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
      ...fetchOptions,
      headers: buildHeaders(fetchOptions.headers || {})
    };

    try {
      const res = await fetch(url, init);

      if (res.ok) {
        if (res.status === 204) return { ok: true, status: res.status, data: null };
        const data = await safeJson(res);
        return { ok: true, status: res.status, data };
      }

      throw await normalizeError({ res, path, method, fallbackCode: "HTTP_ERROR" });
    } catch (err) {
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

  const me = async () => {
    const r = await request("/auth/me", { method: "GET" });
    return r.data;
  };

  // POST /api/auth/login
  // body: { email, password } (STRICT)
  const login = async ({ email, password } = {}) => {
    const e = String(email ?? "").trim();
    const p = String(password ?? "");

    if (!e || !p) {
      throwValidation(
        "/auth/login",
        "POST",
        "Email and password are required",
        { hasEmail: !!e, hasPassword: !!p }
      );
    }

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
    const u = String(username ?? "").trim();
    const e = String(email ?? "").trim();
    const p = String(password ?? "");

    if (!u || !e || !p) {
      throwValidation(
        "/auth/register",
        "POST",
        "Username, email, and password are required",
        { hasUsername: !!u, hasEmail: !!e, hasPassword: !!p }
      );
    }

    const r = await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, email: e, password: p })
    });
    return r.data;
  };

  // POST /api/auth/google
  // body: { credential }
  const googleLogin = async ({ credential } = {}) => {
    const c = String(credential ?? "").trim();
    if (!c) {
      throwValidation("/auth/google", "POST", "Credential is required", { hasCredential: !!c });
    }
    const r = await request("/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: c })
    });
    return r.data;
  };

  // GET /api/auth/google-config
  const getGoogleConfig = async () => {
    const r = await request("/auth/google-config", { method: "GET" });
    return r.data;
  };

  const logout = async () => {
    const r = await request("/auth/logout", { method: "POST" });
    return r.data;
  };

  // POST /api/auth/forgot-password
  const forgotPassword = async ({ email } = {}) => {
    const e = String(email ?? "").trim();
    if (!e) {
      throwValidation(
        "/auth/forgot-password",
        "POST",
        "Email is required",
        { hasEmail: !!e }
      );
    }

    const r = await request("/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e })
    });
    return r.data;
  };

  // POST /api/auth/reset-password
  const resetPassword = async ({ token, newPassword } = {}) => {
    const tkn = String(token ?? "").trim();
    const p = String(newPassword ?? "");
    if (!tkn || !p) {
      throwValidation(
        "/auth/reset-password",
        "POST",
        "Token and newPassword are required",
        { hasToken: !!tkn, hasNewPassword: !!p }
      );
    }

    const r = await request("/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tkn, newPassword: p })
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
    googleLogin,
    getGoogleConfig,
    logout,
    forgotPassword,
    resetPassword,
    BEApiError
  });

  window.BEAuthApi = API;
  window.BEAuthAPI = API;

  console.log("auth-api.js v1.1 READY");
})();
