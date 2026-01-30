/* ==================================================
   GOOGLE SOCIAL AUTH (GIS) — Enterprise Module
   - Preloads config + GIS script (async, on page load)
   - Click stays synchronous (proxy click to rendered Google button)
================================================== */
(() => {
  "use strict";

  if (window.__BE_GIS_BIND_INSTALLED__) return;
  window.__BE_GIS_BIND_INSTALLED__ = true;

  const state = {
    ready: false,
    initStarted: false,
    clientId: "",
    holder: null,
    clickable: null
  };

  // Expose for debugging (optional)
  window.__BE_GIS_STATE__ = state;

  const waitForAuthAPI = (timeoutMs = 5000) =>
    new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const API = window.BEAuthAPI || window.BEAuthApi;
        if (
          API &&
          typeof API.getGoogleConfig === "function" &&
          typeof API.googleLogin === "function"
        ) {
          return resolve(API);
        }
        if (Date.now() - t0 >= timeoutMs) return resolve(null);
        setTimeout(tick, 50);
      };
      tick();
    });

  const loadGisScript = () =>
    new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve(true);

      const existing = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existing) return resolve(true);

      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("GIS_LOAD_FAILED"));
      document.head.appendChild(s);
    });

  const ensureHiddenButton = () => {
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

    state.holder = holder;

    // Render only once
    if (!holder.dataset.beGisRendered && typeof window.google?.accounts?.id?.initialize === "function") {
      if (typeof window.google?.accounts?.id?.renderButton === "function") {
        window.google.accounts.id.renderButton(holder, {
          type: "standard",
          theme: "outline",
          size: "large"
        });
        holder.dataset.beGisRendered = "1";
      }
    }

    // Google may inject async; try now + microtask
    state.clickable = holder.querySelector('div[role="button"], button') || null;
    if (!state.clickable) {
      setTimeout(() => {
        state.clickable = holder.querySelector('div[role="button"], button') || null;
        if (state.clickable) state.ready = true;
      }, 0);
    }
  };

  const gisInit = async () => {
    if (state.ready || state.initStarted) return;
    state.initStarted = true;

    try {
      const API = await waitForAuthAPI(5000);
      if (!API) return;

      const cfg = await API.getGoogleConfig();
      const clientId = String(cfg?.clientId || "").trim();
      if (!clientId) return;

      await loadGisScript();
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

              if (typeof window.BE_closeAuthModals === "function") {
                window.BE_closeAuthModals();
              }
            } catch (e) {
              console.error("Google login failed", e);
            }
          },
          auto_select: false
        });
      }

      ensureHiddenButton();
      if (state.clickable) state.ready = true;
    } catch (e) {
      console.error("GIS init failed", e);
    }
  };

  // Preload in background
  Promise.resolve().then(gisInit);

  // Custom button click proxy (MUST stay synchronous)
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target?.closest?.(".auth-social-btn.google, .auth-social button.google");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

      if (state.ready && state.clickable && typeof state.clickable.click === "function") {
        state.clickable.click();
        return;
      }

      // Not ready: start init async (do NOT await)
      gisInit();
      console.warn("Google login is initializing. Click again in 1–2 seconds.");
    },
    true
  );
})();
