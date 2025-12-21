/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v5.6)
 * Single source of truth for Login / Register overlays
 *
 * FIX:
 * - DO NOT "lock init" before overlays exist (prevents permanent dead init)
 * - Event delegation for Forgot Password (works with dynamic injection)
 *********************************************************/

/* =======================
   UTILS
======================= */
const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

const lockBody = (lock) => {
  document.body.style.overflow = lock ? "hidden" : "";
};

/* =======================
   SINGLETON GUARDS
======================= */
let __beAuthBound = false;
let __beAuthDelegationBound = false;

/* =======================
   INIT AUTH
======================= */
function initAuth() {
  // IMPORTANT: do NOT mark as initialized until overlays exist
  const loginOverlay = qs("#login-modal");
  const registerOverlay = qs("#register-modal");

  if (!loginOverlay || !registerOverlay) return;

  if (__beAuthBound) return;
  __beAuthBound = true;

  const loginForm = () => loginOverlay.querySelector(".auth-form");
  const forgotSection = () => loginOverlay.querySelector(".auth-forgot-section");

  const resetForgotInline = () => {
    loginOverlay.classList.remove("state-forgot-open");

    const lf = loginForm();
    const fs = forgotSection();

    if (lf) lf.style.display = "";
    if (fs) {
      fs.style.display = "none";
      fs.setAttribute("aria-hidden", "true");
    }
  };

  const closeAll = () => {
    resetForgotInline();
    loginOverlay.classList.remove("show");
    registerOverlay.classList.remove("show");
    lockBody(false);
  };

  const openLogin = () => {
    closeAll();
    loginOverlay.classList.add("show");
    lockBody(true);
  };

  const openRegister = () => {
    closeAll();
    registerOverlay.classList.add("show");
    lockBody(true);
  };

  /* Triggers (desktop) */
  on(qs(".btn-auth.login"), "click", (e) => {
    e.preventDefault();
    openLogin();
  });

  on(qs(".btn-auth.register"), "click", (e) => {
    e.preventDefault();
    openRegister();
  });

  /* Triggers (mobile menu) */
  on(qs(".menu-auth-login"), "click", (e) => {
    if (e && e.preventDefault) e.preventDefault();
    openLogin();
  });

  on(qs(".menu-auth-register"), "click", (e) => {
    if (e && e.preventDefault) e.preventDefault();
    openRegister();
  });

  /* Close handlers */
  [loginOverlay, registerOverlay].forEach((overlay) => {
    on(overlay.querySelector(".auth-close"), "click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      closeAll();
    });

    on(overlay, "click", (e) => {
      if (e.target === overlay) closeAll();
    });
  });

  /* Switch between modals */
  qsa(".auth-switch").forEach((btn) => {
    on(btn, "click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const target = btn.dataset.authTarget;
      if (target === "login") openLogin();
      if (target === "register") openRegister();
    });
  });

  /* ESC (bind once) */
  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;

    if (
      loginOverlay.classList.contains("show") ||
      registerOverlay.classList.contains("show")
    ) {
      closeAll();
    }
  });

  /* Public API */
  window.BE_openLogin = openLogin;
  window.BE_openRegister = openRegister;

  // Ensure default forgot is hidden safely if section exists
  resetForgotInline();
}

/* =======================
   FORGOT PASSWORD — EVENT DELEGATION
   Works even when modal HTML is injected after init
======================= */
function bindForgotDelegationOnce() {
  if (__beAuthDelegationBound) return;
  __beAuthDelegationBound = true;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".auth-forgot-link, .auth-forgot");
    if (!trigger) return;

    const loginOverlay = qs("#login-modal");
    if (!loginOverlay) return;

    const loginForm = loginOverlay.querySelector(".auth-form");
    const forgotSection = loginOverlay.querySelector(".auth-forgot-section");

    // If markup missing, do nothing (no errors)
    if (!loginForm || !forgotSection) return;

    e.preventDefault();
    e.stopPropagation();

    loginOverlay.classList.add("show");
    loginOverlay.classList.add("state-forgot-open");

    loginForm.style.display = "none";
    forgotSection.style.display = "block";
    forgotSection.setAttribute("aria-hidden", "false");

    lockBody(true);
  });
}

/* =======================
   EVENT BINDING
======================= */
bindForgotDelegationOnce();

document.addEventListener("headerLoaded", initAuth);

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
  initAuth();
}
