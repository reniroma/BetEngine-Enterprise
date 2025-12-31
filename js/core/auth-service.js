/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE (API HYDRATE)
 * Single source of truth for auth state
 * Persistence: localStorage
 * Hydrate: GET /api/auth/me (cookie-based)
 * Emits: auth:changed
 *********************************************************/
(() => {
  "use strict";

  const STORAGE_KEY = "BE_AUTH_STATE";
  const ME_ENDPOINT = "/api/auth/me";

  const defaultState = {
    authenticated: false,
    user: null,
    role: "user",
    premium: false
  };

  /* ==================================================
     USER NORMALIZATION (GLOBAL INVARIANT)
     authenticated === true => user.username MUST exist
  ================================================== */
  function normalizeUser(user) {
    if (!user || typeof user !== "object") return { username: "testuser" };
    if (!user.username) return { ...user, username: "testuser" };
    return user;
  }

  function normalizeState(next) {
    const s = next && typeof next === "object" ? next : { ...defaultState };
    if (s.authenticated === true) {
      return { ...s, user: normalizeUser(s.user) };
    }
    return { ...defaultState, ...s, authenticated: false, user: null };
  }

  function safeJsonParse(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? safeJsonParse(raw) : null;
      const merged = parsed ? { ...defaultState, ...parsed } : { ...defaultState };
      return normalizeState(merged);
    } catch {
      return { ...defaultState };
    }
  }

  let state = load();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }

  function emit() {
    state = normalizeState(state);
    document.dispatchEvent(new CustomEvent("auth:changed", { detail: { ...state } }));
  }

  function setAuth(payload = {}) {
    const next = normalizeState({
      ...state,
      ...payload,
      authenticated: true
    });

    state = next;
    persist();
    emit();
  }

  function clearAuth() {
    state = { ...defaultState };
    persist();
    emit();
  }

  function getState() {
    return normalizeState({ ...state });
  }

  /* ==================================================
     API HYDRATE (COOKIE-BASED)
     - If /api/auth/me exists:
       - 200 => setAuth(payload from server)
       - 401/403 => clearAuth()
     - If 404 or network error => keep local state (dev/static)
  ================================================== */
  async function hydrateFromAPI() {
    try {
      const res = await fetch(ME_ENDPOINT, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (res.status === 404) return; // API not mounted (static hosting)
      if (res.status === 401 || res.status === 403) {
        clearAuth();
        return;
      }
      if (!res.ok) return;

      const json = await res.json().catch(() => null);
      if (!json) return;

      // Supports either:
      // A) { ok:true, data:{ authenticated:true, user, role, premium } }
      // B) { authenticated:true, user, role, premium }
      const payload = json.ok === true ? json.data : json;

      if (payload && payload.authenticated === true) {
        setAuth({
          user: payload.user || null,
          role: payload.role || "user",
          premium: !!payload.premium
        });
        return;
      }

      // If server explicitly says not authenticated
      if (payload && payload.authenticated === false) {
        clearAuth();
      }
    } catch {
      // Network error / offline => keep local state
    }
  }

  // Public API
  window.BEAuth = {
    setAuth,
    clearAuth,
    getState
  };

  // Initial hydrate from local storage (immediate UI sync)
  emit();

  // Then hydrate from server (cookie session), if available
  hydrateFromAPI();
})();
