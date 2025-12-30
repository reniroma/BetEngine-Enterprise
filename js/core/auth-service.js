/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE (FINAL FIX)
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

  /* ==================================================
     USER NORMALIZATION (GLOBAL INVARIANT)
     authenticated === true => user.username MUST exist
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

  function normalizeState(state) {
    if (state.authenticated === true) {
      return {
        ...state,
        user: normalizeUser(state.user)
      };
    }
    return state;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw
        ? { ...defaultState, ...JSON.parse(raw) }
        : { ...defaultState };

      return normalizeState(parsed);
    } catch {
      return { ...defaultState };
    }
  }

  let state = load();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  // Public API
  window.BEAuth = {
    setAuth,
    clearAuth,
    getState
  };

  // Initial hydrate
  emit();
})();
