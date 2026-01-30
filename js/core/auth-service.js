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
    } catch {}
  };

  const clearPersisted = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  /* =========================
     UI helpers (close overlays)
  ========================= */
  const closeAuthOverlays = () => {
    const nodes = document.querySelectorAll(
      "#login-modal, #register-modal, #forgot-password-modal, .be-auth-overlay"
    );
    nodes.forEach((el) => el.classList.remove("show", "open", "active"));

    document.body.classList.remove("be-locked", "no-scroll");
    document.documentElement.classList.remove("be-locked", "no-scroll");
    document.body.style.overflow = "";
  };

  document.addEventListener("auth:changed", (e) => {
    try {
      const st = e && e.detail ? e.detail : null;
      if (st && st.authenticated === true) closeAuthOverlays();
    } catch {}
  });

  /* =========================
     Public API
  ========================= */

  async function hydrate() {
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

    try {
      const api = window.BEAuthAPI || window.BEAuthApi;

      if (api && typeof api.me === "function") {
        const payload = await api.me();
        applyFromMePayload(payload);
        emit();
        return getState();
      }

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });

      if (res.status === 200) {
        const payload = await safeJson(res);
        applyFromMePayload(payload || {});
      } else {
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
    if (isGitHubPagesHost()) {
      state = { ...defaultState };
      clearPersisted();
      emit();
      return getState();
    }

    try {
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
    } catch {}

    state = { ...defaultState };
    clearPersisted();
    emit();
    return getState();
  }

  function getState() {
    return { ...state };
  }

  /* ==================================================
     ✅ FIX: expose read-only state for UI compatibility
  ================================================== */
  window.BEAuth = {
    hydrate,
    setAuth,
    clearAuth,
    getState,
    get state() {
      return getState();
    }
  };

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

  const readCreds = (formEl) => {
    try {
      const fd = new FormData(formEl);
      const emailRaw = fd.get("email");
      const passRaw = fd.get("password");

      const email = typeof emailRaw === "string" ? emailRaw.trim() : "";
      const password = typeof passRaw === "string" ? passRaw : "";

      if (email || password) return { email, password };
    } catch {}

    const e = pick(formEl, ['input[name="email"]', '#email', 'input[type="email"]']);
    const p = pick(formEl, ['input[name="password"]', '#password', 'input[type="password"]']);

    return {
      email: (e && e.value ? e.value.trim() : ""),
      password: (p && p.value ? p.value : "")
    };
  };

  const callLogin = async (email, password) => {
    const api = window.BEAuthAPI || window.BEAuthApi || window.BEAuth;
    if (!api || typeof api.login !== "function") return;

    const r = api.login({ email, password });
    if (r && typeof r.then === "function") await r;
  };

  document.addEventListener(
    "submit",
    (e) => {
      const formEl =
        (e.target && e.target.tagName === "FORM")
          ? e.target
          : (e.target && e.target.closest ? e.target.closest("form") : null);

      if (!formEl) return;

      const isAuth =
        formEl.classList.contains("auth-form") ||
        !!formEl.closest(".auth-form");

      if (!isAuth) return;

      e.preventDefault();
      e.stopPropagation();

      const { email, password } = readCreds(formEl);
      if (!email || !password) return;

      (async () => {
        await callLogin(email, password);
        if (window.BEAuth && typeof window.BEAuth.hydrate === "function") {
          await window.BEAuth.hydrate();
        }
        closeAuthOverlays();
      })().catch(() => {});
    },
   true
  );
})();


  // ==================================================
  // GOOGLE SOCIAL AUTH (GIS) — enterprise module
  // - Preloads config + GIS script (async, on page load)
  // - Click remains synchronous (proxy click to rendered Google button)
  // ==================================================
  if (!window.__BE_GIS_BIND_INSTALLED__) {
    window.__BE_GIS_BIND_INSTALLED__ = true;

    const __beGisState = {
      ready: false,
      initStarted: false,
      clientId: "",
      holder: null,
      clickable: null
    };

    const __beWaitForAuthAPI = (timeoutMs = 5000) =>
      new Promise((resolve) => {
        const t0 = Date.now();
        const tick = () => {
          const API = window.BEAuthAPI || window.BEAuthApi;
          if (API && typeof API.getGoogleConfig === "function" && typeof API.googleLogin === "function") {
            return resolve(API);
          }
          if (Date.now() - t0 >= timeoutMs) return resolve(null);
          setTimeout(tick, 50);
        };
        tick();
      });

    const __beLoadGisScript = () =>
      new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve(true);

        const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existing) return resolve(true);

        const s = document.createElement("script");
        s.src = "https://accounts.google.com/gsi/client";
        s.async = true;
        s.defer = true;
        s.onload = () => resolve(true);
        s.onerror = () => reject(new Error("GIS_LOAD_FAILED"));
        document.head.appendChild(s);
      });

    const __beEnsureHiddenButton = () => {
      const holderId = "be-gis-hidden";
      let holder = document.getElementById(holderId);
      if (!holder) {
        holder = document.createElement("div");
        holder.id = holderId;
        holder.style.position = "fixed";
        holder.style.left = "-9999px";
        holder.style.top = "-9999px";
        holder.style.width = "1px";
        holder.style.height = "1px";
        holder.style.overflow = "hidden";
        document.body.appendChild(holder);
      }
      __beGisState.holder = holder;

      if (!holder.dataset.beGisRendered && typeof window.google?.accounts?.id?.renderButton === "function") {
        window.google.accounts.id.renderButton(holder, {
          type: "standard",
          theme: "outline",
          size: "large"
        });
        holder.dataset.beGisRendered = "1";
      }

      __beGisState.clickable = holder.querySelector('div[role="button"], button');
    };

    const __beGisInit = async () => {
      if (__beGisState.ready || __beGisState.initStarted) return;
      __beGisState.initStarted = true;

      try {
        const API = await __beWaitForAuthAPI(5000);
        if (!API) return;

        const cfg = await API.getGoogleConfig();
        const clientId = String(cfg?.clientId || "").trim();
        if (!clientId) return;

        await __beLoadGisScript();
        if (!window.google?.accounts?.id) return;

        if (window.__BE_GIS_INIT__ !== true) {
          window.__BE_GIS_INIT__ = true;

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (resp) => {
              try {
                const cred = String(resp?.credential || "").trim();
                if (!cred) throw new Error("NO_CREDENTIAL");

                await API.googleLogin({ credential: cred });

                if (window.BEAuth && typeof window.BEAuth.hydrate === "function") {
                  await window.BEAuth.hydrate();
                }

                if (typeof window.BE_closeAuthModals === "function") window.BE_closeAuthModals();
              } catch (e) {
                console.error("Google login failed", e);
              }
            },
            auto_select: false
          });
        }

        __beEnsureHiddenButton();
        if (__beGisState.clickable) __beGisState.ready = true;
      } catch (e) {
        console.error("GIS init failed", e);
      }
    };

    // Preload in background (does NOT depend on user gesture)
    Promise.resolve().then(__beGisInit);

    // Custom button click proxy (MUST stay synchronous)
    document.addEventListener(
      "click",
      (e) => {
        const btn = e.target?.closest?.(".auth-social-btn.google, .auth-social button.google");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

        if (__beGisState.ready && __beGisState.clickable && typeof __beGisState.clickable.click === "function") {
          __beGisState.clickable.click();
          return;
        }

        // Not ready yet: start init (async) but do NOT await here (keep user gesture clean)
        __beGisInit();
        console.warn("Google login is still initializing. Please click again in 1–2 seconds.");
      },
      true
    );
  }

})();
