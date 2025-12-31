/*********************************************************
 * BetEngine Enterprise – AUTH API CLIENT (FINAL v1.0)
 * Frontend-only client for same-origin Auth API (/api)
 *
 * RESPONSIBILITY:
 * - Submit interception for Login/Register forms
 * - Calls:
 *   - GET  /api/auth/me
 *   - POST /api/auth/login
 *   - POST /api/auth/register
 *   - POST /api/auth/logout
 * - CSRF support via cookie + header (X-CSRF-Token)
 * - Updates BEAuth state (single source of truth)
 * - Closes auth modals on success
 *
 * DOES NOT:
 * - Change HTML/CSS
 * - Implement backend logic
 * - Touch mobile menu logic (handled elsewhere)
 *********************************************************/
(() => {
  "use strict";

  /* =======================
     CONFIG (SAME ORIGIN)
  ======================= */
  const API_BASE = "/api";
  const ENDPOINTS = {
    me: `${API_BASE}/auth/me`,
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    logout: `${API_BASE}/auth/logout`
  };

  /* =======================
     HELPERS
  ======================= */
  const qs = (sel, scope = document) => scope.querySelector(sel);

  const warn = (...args) => console.warn("[AuthAPI]", ...args);

  function getCookie(name) {
    try {
      const parts = document.cookie.split(";").map(s => s.trim());
      for (const p of parts) {
        if (p.startsWith(name + "=")) return decodeURIComponent(p.slice(name.length + 1));
      }
      return "";
    } catch {
      return "";
    }
  }

  function getCsrfToken() {
    // Backend should set a readable CSRF cookie (NOT HttpOnly), e.g. BE_CSRF
    return getCookie("BE_CSRF");
  }

  function closeAllAuthModals() {
    document
      .querySelectorAll(".be-auth-overlay.show")
      .forEach(m => m.classList.remove("show"));

    // release scroll lock if auth modal was locking it
    document.body.style.overflow = "";
  }

  async function apiFetch(url, opts = {}) {
    const method = (opts.method || "GET").toUpperCase();

    const headers = {
      "Accept": "application/json",
      ...(opts.headers || {})
    };

    // Send JSON when body is present
    if (opts.body && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // CSRF for non-GET requests
    if (method !== "GET") {
      const csrf = getCsrfToken();
      if (csrf) headers["X-CSRF-Token"] = csrf;
    }

    const res = await fetch(url, {
      method,
      credentials: "include", // REQUIRED for cookie sessions
      headers,
      body: opts.body
    });

    // Try JSON first, fallback to text
    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = { message: await res.text() };
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      const errMsg =
        (data && (data.error || data.message)) ||
        `Request failed (${res.status})`;
      const err = new Error(errMsg);
      err.status = res.status;
      err.payload = data;
      throw err;
    }

    return data;
  }

  function applyAuthStateFromServer(payload) {
    // Expected server response:
    // { authenticated: boolean, user: {username,...} | null, role?, premium? }
    if (!window.BEAuth || typeof window.BEAuth.setAuth !== "function") {
      warn("BEAuth service not available");
      return;
    }

    const authenticated = !!payload?.authenticated;

    if (authenticated) {
      window.BEAuth.setAuth({
        authenticated: true,
        user: payload.user || null,
        role: payload.role || "user",
        premium: !!payload.premium
      });
    } else {
      window.BEAuth.clearAuth?.();
    }
  }

  function readLoginPayload(form) {
    const u = form.querySelector('input[name="username"]')?.value || "";
    const p = form.querySelector('input[name="password"]')?.value || "";
    return { username: u.trim(), password: p };
  }

  function readRegisterPayload(form) {
    const u = form.querySelector('input[name="username"]')?.value || "";
    const e = form.querySelector('input[name="email"]')?.value || "";
    const p = form.querySelector('input[name="password"]')?.value || "";
    return { username: u.trim(), email: e.trim(), password: p };
  }

  function isInsideModal(form, modalId) {
    const modal = document.getElementById(modalId);
    return !!modal && modal.contains(form);
  }

  function setFormBusy(form, busy) {
    const submit = form.querySelector('button[type="submit"], .auth-submit[type="submit"]');
    if (submit) submit.disabled = !!busy;
    form.dataset.beBusy = busy ? "1" : "0";
  }

  /* =======================
     PUBLIC API (OPTIONAL)
  ======================= */
  async function refreshMe() {
    try {
      const data = await apiFetch(ENDPOINTS.me);
      applyAuthStateFromServer(data);
      return data;
    } catch (err) {
      // If /me fails, fall back to guest (safe)
      window.BEAuth?.clearAuth?.();
      return null;
    }
  }

  async function logout() {
    const data = await apiFetch(ENDPOINTS.logout, { method: "POST" });
    applyAuthStateFromServer(data);
    return data;
  }

  window.BEAuthAPI = {
    refreshMe,
    logout
  };

  /* =======================
     INIT (HYDRATE FROM SERVER)
  ======================= */
  // Hydrate as early as possible. If backend not ready, it safely falls back to guest.
  refreshMe();

  /* =======================
     FORM SUBMISSION (LOGIN/REGISTER)
     NOTE: Auth mock MUST be removed from index.html
  ======================= */
  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("form.auth-form");
    if (!form) return;

    // Only handle forms inside our auth modals
    const isLogin = isInsideModal(form, "login-modal");
    const isRegister = isInsideModal(form, "register-modal");
    if (!isLogin && !isRegister) return;

    e.preventDefault();

    // Prevent double submits
    if (form.dataset.beBusy === "1") return;

    try {
      setFormBusy(form, true);

      if (isLogin) {
        const payload = readLoginPayload(form);
        const data = await apiFetch(ENDPOINTS.login, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        applyAuthStateFromServer(data);
        closeAllAuthModals();
        return;
      }

      if (isRegister) {
        const payload = readRegisterPayload(form);
        const data = await apiFetch(ENDPOINTS.register, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        applyAuthStateFromServer(data);
        closeAllAuthModals();
        return;
      }
    } catch (err) {
      // Enterprise-safe: do not break UI; log only
      warn(err.message || "Auth request failed", err);
    } finally {
      setFormBusy(form, false);
    }
  });

  /* =======================
     LOGOUT (MOBILE + DESKTOP)
  ======================= */
  document.addEventListener("click", async (e) => {
    const logoutEl = e.target.closest(".auth-user-logout, .mobile-auth-user .logout");
    if (!logoutEl) return;

    e.preventDefault();

    try {
      await logout();
      // Do NOT force-close hamburger here; that is handled by its own module.
    } catch (err) {
      warn(err.message || "Logout failed", err);
    }
  });
})();
