/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE (FINAL)
 * Single source of truth for auth state
 * Persistence: localStorage
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

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? { ...defaultState, ...JSON.parse(raw) }
        : { ...defaultState };
    } catch {
      return { ...defaultState };
    }
  }

  let state = load();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function emit() {
    document.dispatchEvent(
      new CustomEvent("auth:changed", {
        detail: { ...state }
      })
    );
  }

  /* ==================================================
     CRITICAL GUARANTEE
     - If authenticated === true
     - user.username MUST exist
     - UI NEVER receives empty user
  ================================================== */
  function normalizeUser(user) {
    if (!user || typeof user !== "object") {
      return { username: "testuser" };
    }

    if (!user.username) {
      return { ...user, username: "testuser" };
    }

    return user;
  }

  function setAuth(payload = {}) {
    const user = normalizeUser(payload.user);

    state = {
      ...state,
      ...payload,
      authenticated: true,
      user
    };

    persist();
    emit();
  }

  function clearAuth() {
    state = { ...defaultState };
    persist();
    emit();
  }

  function getState() {
    return { ...state };
  }

  // Public API
  window.BEAuth = {
    setAuth,
    clearAuth,
    getState
  };

  // Initial hydrate (important for mobile header)
  emit();
})();
