/*********************************************************
 * BetEngine Enterprise – AUTH SERVICE
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
      return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
    } catch {
      return { ...defaultState };
    }
  }

  let state = load();

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function emit() {
    document.dispatchEvent(new CustomEvent("auth:changed", { detail: state }));
  }

  function setAuth(payload) {
    state = { ...state, ...payload, authenticated: true };
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

  // Expose API
  window.BEAuth = {
    setAuth,
    clearAuth,
    getState
  };

  // Emit on boot (hydrate UI)
  emit();
})();
