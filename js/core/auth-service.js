/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE (FINAL v2.0)
 * Single source of truth for auth state
 *
 * Storage: localStorage (UI persistence)
 * Server hydrate: GET /api/auth/me (cookie session)
 * Emits: auth:changed
 *********************************************************/
(() => {
  "use strict";

  const STORAGE_KEY = "BE_AUTH_STATE";

  const defaultState = {
    authenticated: false,
    user: null,
    role: "user",
    premium: false
  };

  /* ==================================================
     NORMALIZATION
     Invariant: authenticated === true => user.username exists
  ================================================== */
  function normalizeUser(user) {
    if (!user || typeof user !== "object") {
      return { username: "user" };
    }
    if (!user.username) {
      return { ...user, username: "user" };
    }
    return user;
  }

  function normalizeState(s) {
    const state = s && typeof s === "object" ? s : {};
    if (state.authenticated === true) {
      return { ...defaultState, ...state, user: normalizeUser(state.user) };
    }
    return { ...defaultState, ...state, authenticated: false, user: null };
  }

  function safeLocalStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }

  function loadFromStorage() {
    try {
      const raw = safeLocalStorageGet(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return normalizeState(parsed || defaultState);
    } catch {
      return { ...defaultState };
    }
  }

  let state = loadFromStorage();

  function persist() {
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(state));
  }

  function emit() {
    state = normalizeState(state);
    document.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { ...state } })
    );
  }

  function setAuth(payload = {}) {
    state = normalizeState({
      ...state,
      ...payload,
      authenticated: true
    });

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
     SERVER HYDRATE (COOKIE SESSION)
     - Attempts /api/auth/me
     - If 200: overwrite state with server truth
     - If 401/403: clear auth
     - If 404/network: keep storage state (dev/Pages safe)
  ================================================== */
  async function hydrate() {
    const url = "/api/auth/me";

    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (res.status === 200) {
        const data = await res.json().catch(() => ({}));

        // Accept either:
        // A) { authenticated, user, role, premium }
        // B) { user, role, premium } (implies authenticated)
        const next = {
          ...defaultState,
          ...data,
          authenticated:
            typeof data.authenticated === "boolean"
              ? data.authenticated
              : !!data.user
        };

        state = normalizeState(next);
        persist();
        return;
      }

      if (res.status === 401 || res.status === 403) {
        state = { ...defaultState };
        persist();
        return;
      }

      // 404 or other: keep current (storage) state
    } catch {
      // Network / no backend: keep current (storage) state
    }
  }

  // Public API
  window.BEAuth = {
    setAuth,
    clearAuth,
    getState,
    hydrate
  };

  // Initial hydrate then emit once (prevents flicker)
  hydrate().finally(() => {
    emit();
  });
})();
