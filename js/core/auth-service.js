/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE (COOKIE SESSION)
 * Single source of truth for auth state (frontend)
 *
 * Session: HttpOnly cookie (server-side)
 * Hydrate: GET /api/auth/me (same-origin)
 * Emits: auth:changed (CustomEvent)
 *
 * IMPORTANT:
 * - No localStorage persistence (cookie is the source of truth)
 * - Safe on GitHub Pages: /api may 404 until backend exists
 *********************************************************/
(() => {
  "use strict";

  const API_BASE = "/api";

  const defaultState = {
    authenticated: false,
    user: null,
    role: "user",
    premium: false
  };

  let state = { ...defaultState };

  /* =========================
     Helpers
  ========================= */
  const normalizeUser = (user) => {
    if (!user || typeof user !== "object") return null;

    // Ensure username exists for UI (fallback is safe)
    const username =
      typeof user.username === "string" && user.username.trim()
        ? user.username.trim()
        : (typeof user.email === "string" && user.email.includes("@")
            ? user.email.split("@")[0]
            : "user");

    return { ...user, username };
  };

  const emit = () => {
    document.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { ...state } })
    );
  };

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const applyFromMePayload = (payload) => {
    // Accept multiple backend shapes safely:
    // A) { authenticated, user, role, premium }
    // B) { user, role, premium }  (implies authenticated if user exists)
    // C) { data: { user, ... } }  (some wrappers)
    const p = payload && payload.data ? payload.data : payload;

    const u = normalizeUser(p && p.user ? p.user : null);
    const authenticated =
      typeof p?.authenticated === "boolean" ? p.authenticated : !!u;

    state = {
      authenticated,
      user: authenticated ? u : null,
      role: typeof p?.role === "string" && p.role ? p.role : "user",
      premium: !!p?.premium
    };
  };

  /* =========================
     GitHub Pages persistence (safe)
  ========================= */
  const STORAGE_KEY = "BE_AUTH_STATE";

  const isGitHubPagesHost = () => /(^|\.)github\.io$/i.test(location.hostname);

  const loadPersisted = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && typeof data === "object" ? data : null;
    } catch {
      return null;
    }
  };

  const persistCurrent = () => {
    if (!isGitHubPagesHost()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()));
    } catch {
      // ignore
    }
  };

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  /* =========================
     UI helpers (close overlays)
  ========================= */
  const closeAuthOverlays = () => {
    // Best-effort close (desktop + mobile)
    const nodes = document.querySelectorAll(
      "#login-modal, #register-modal, #forgot-password-modal, .be-auth-overlay"
    );
    nodes.forEach((el) => el.classList.remove("show", "open", "active"));

    // Safety: remove common body locks
    document.body.classList.remove("be-locked", "no-scroll");
    document.documentElement.classList.remove("be-locked", "no-scroll");
    document.body.style.overflow = "";
  };

  // Auto-close auth overlays after successful auth state
  document.addEventListener("auth:changed", (e) => {
    try {
      const st = e && e.detail ? e.detail : null;
      if (st && st.authenticated === true) closeAuthOverlays();
    } catch {
      // ignore
    }
  });

  /* =========================
     Public API
  ========================= */

  async function hydrate() {
    // GitHub Pages is static (no backend). Never call /api there.
    if (isGitHubPagesHost()) {
      const persisted = loadPersisted();

      if (persisted && persisted.authenticated && persisted.user) {
        state = {
          ...defaultState,
          authenticated: true,
          user: normalizeUser(persisted.user) || { username: "user" },
          role: typeof persisted.role === "string" && persisted.role ? persisted.role : "user",
          premium: !!persisted.premium
        };
      } else {
        state = { ...defaultState };
      }

      emit();
      return getState();
    }

    // Try using the dedicated API client if present
    try {
      // PATCH: support both names (BEAuthAPI is the canonical one)
      const api = window.BEAuthAPI || window.BEAuthApi;

      if (api && typeof api.me === "function") {
        const payload = await api.me(); // should throw or return JSON
        applyFromMePayload(payload);
        emit();
        return getState();
      }

      // Fallback direct fetch (same-origin cookie)
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (res.status === 200) {
        const payload = await safeJson(res);
        applyFromMePayload(payload || {});
      } else {
        // 401/403/404/500/etc. -> keep safe unauth state
        state = { ...defaultState };
      }

      emit();
      return getState();
    } catch {
      state = { ...defaultState };
      emit();
      return getState();
    }
  }

  // Dev/Mock helper (does NOT set cookies; UI-only)
  function setAuth(payload = {}) {
    const user = normalizeUser(payload.user || payload);
    state = {
      authenticated: true,
      user: user || { username: "testuser" },
      role: typeof payload.role === "string" && payload.role ? payload.role : "user",
      premium: !!payload.premium
    };
    persistCurrent();
    emit();
    return getState();
  }

  async function clearAuth() {
    // GitHub Pages is static (no backend). Never call /api there.
    if (isGitHubPagesHost()) {
      state = { ...defaultState };
      clearPersisted();
      emit();
      return getState();
    }

    // Try to logout server-side (cookie)
    try {
      // PATCH: support both names (BEAuthAPI is the canonical one)
      const api = window.BEAuthAPI || window.BEAuthApi;

      if (api && typeof api.logout === "function") {
        await api.logout();
      } else {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" }
        });
      }
    } catch {
      // ignore (client must still reset UI)
    }

    state = { ...defaultState };
    clearPersisted();
    emit();
    return getState();
  }

  function getState() {
    return { ...state };
  }

  window.BEAuth = {
    hydrate,
    setAuth,     // dev-only helper (kept for auth-mock.js)
    clearAuth,
    getState
  };

  // Initial: emit safe default immediately, then hydrate async
  emit();
  hydrate();

  console.log("auth-service.js v2.2 READY");
})();

/* =========================================================
   AUTH FORM DELEGATION (ENTERPRISE SAFE)
   Fix: prevent native GET submit + call login API
========================================================= */
(function () {
  "use strict";

  if (window.__BE_AUTH_FORM_DELEGATION_INSTALLED__) return;
  window.__BE_AUTH_FORM_DELEGATION_INSTALLED__ = true;

  const pick = (root, sels) => {
    for (const s of sels) {
      const el = root.querySelector(s);
      if (el) return el;
    }
    return null;
  };

  const closeAuthOverlays = () => {
    const nodes = document.querySelectorAll(
      "#login-modal, #register-modal, #forgot-password-modal, .be-auth-overlay"
    );
    nodes.forEach((el) => el.classList.remove("show", "open", "active"));
    document.body.classList.remove("be-locked", "no-scroll");
    document.documentElement.classList.remove("be-locked", "no-scroll");
    document.body.style.overflow = "";
  };

  const readCreds = (form) => {
    const e = pick(form, ['input[name="email"]', '#email', 'input[type="email"]', 'input[type="text"]']);
    const p = pick(form, ['input[name="password"]', '#password', 'input[type="password"]']);
    return {
      email: (e && e.value ? e.value.trim() : ""),
      password: (p && p.value ? p.value : "")
    };
  };

  const callLogin = async (email, password) => {
    const api = window.BEAuthAPI || window.BEAuthApi || window.BEAuth;
    if (!api || typeof api.login !== "function") {
      console.warn("[BEAuth] login() not available on BEAuthAPI/BEAuthApi/BEAuth");
      return;
    }

    // STRICT: BEAuthAPI.login expects an object { email, password }
    const r = api.login({ email, password });
    if (r && typeof r.then === "function") await r;
  };

  document.addEventListener(
    "submit",
    (e) => {
      const form = e.target && e.target.closest ? e.target.closest(".auth-form") : null;
      if (!form) return;

      e.preventDefault();
      e.stopPropagation();

      const { email, password } = readCreds(form);
      if (!email || !password) {
        console.warn("[BEAuth] Missing email/password");
        return;
      }

      (async () => {
        await callLogin(email, password);

        // Immediately refresh auth state (no Ctrl+R needed)
        if (window.BEAuth && typeof window.BEAuth.hydrate === "function") {
          await window.BEAuth.hydrate();
        }

        // Best-effort close overlays right away
        closeAuthOverlays();
      })().catch((err) => {
        console.error("[BEAuth] Login failed:", err);
      });
    },
    true
  );
})();
