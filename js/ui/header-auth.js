/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v6.2)
 * Single source of truth for Login / Register / Forgot
 *
 * ENTERPRISE FIX (v6.2):
 * - Add robust form submit handling (login/register/forgot)
 * - Render inline error messages on failed auth attempts
 * - Clear email + password on INVALID_CREDENTIALS (per requirement)
 * - Keep existing behavior: no CSS edits, no mobile header edits, no auth-api edits
 *********************************************************/

/* =======================
   UTILS
======================= */
const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const lockBody = (lock) => {
  document.body.style.overflow = lock ? "hidden" : "";
};

/* ======================================================
   MOBILE MENU CLOSE (SAFE)
====================================================== */
function closeMobileMenuIfOpen() {
  // Prefer existing handlers (header-mobile.js) to preserve behavior
  const closeBtn = qs(".mobile-menu-close");
  const overlay = qs(".mobile-menu-overlay");

  if (closeBtn) {
    closeBtn.click();
    return;
  }
  if (overlay) {
    overlay.click();
    return;
  }

  // Fallback cleanup (safe)
  const panel = qs(".mobile-menu-panel");
  overlay?.classList.remove("show");
  panel?.classList.remove("open", "premium-mode");
  document.body.style.overflow = "";
  document.body.classList.remove("menu-open");
}

/* =======================
   INIT AUTH (LOGIN / REGISTER)
======================= */
function initAuth() {
  // Prevent double init
  if (document.documentElement.dataset.beAuthInit === "1") return;
  document.documentElement.dataset.beAuthInit = "1";

  const loginModal = qs("#login-modal");
  const registerModal = qs("#register-modal");

  if (!loginModal || !registerModal) return;

  const closeAll = () => {
    loginModal.classList.remove("show", "state-forgot-open");
    registerModal.classList.remove("show");
    lockBody(false);
  };

  const openLogin = () => {
    closeAll();
    loginModal.classList.add("show");
    lockBody(true);
  };

  const openRegister = () => {
    closeAll();
    registerModal.classList.add("show");
    lockBody(true);
  };

  /* Desktop header buttons (may exist multiple times) */
  qsa(".btn-auth.login").forEach((btn) => {
    on(btn, "click", (e) => {
      e.preventDefault();
      openLogin();
    });
  });

  qsa(".btn-auth.register").forEach((btn) => {
    on(btn, "click", (e) => {
      e.preventDefault();
      openRegister();
    });
  });

  /* Mobile menu buttons (may exist multiple times) */
  qsa(".menu-auth-login").forEach((btn) => {
    on(btn, "click", (e) => {
      if (e) e.preventDefault();
      closeMobileMenuIfOpen();
      openLogin();
    });
  });

  qsa(".menu-auth-register").forEach((btn) => {
    on(btn, "click", (e) => {
      if (e) e.preventDefault();
      closeMobileMenuIfOpen();
      openRegister();
    });
  });

  /* Close buttons + overlay click */
  [loginModal, registerModal].forEach((modal) => {
    on(modal.querySelector(".auth-close"), "click", closeAll);
    on(modal, "click", (e) => {
      if (e.target === modal) closeAll();
    });
  });

  /* Switch login ↔ register */
  document.querySelectorAll(".auth-switch").forEach((btn) => {
    on(btn, "click", (e) => {
      e.preventDefault();
      const target = btn.dataset.authTarget;
      if (target === "login") openLogin();
      if (target === "register") openRegister();
    });
  });

  /* ESC */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  /* Public API */
  window.BE_openLogin = openLogin;
  window.BE_openRegister = openRegister;

  // Expose close for form handlers (internal safe use)
  window.BE_closeAuthModals = closeAll;
}

/* ======================================================
   FORGOT PASSWORD (EVENT DELEGATION)
====================================================== */
document.addEventListener("click", (e) => {
  const forgotBtn = e.target.closest(".auth-forgot-link, .auth-forgot");
  if (!forgotBtn) return;

  const loginModal = document.getElementById("login-modal");
  if (!loginModal) return;

  e.preventDefault();
  e.stopPropagation();

  loginModal.classList.add("state-forgot-open");
});

/* ======================================================
   INLINE MESSAGE HELPERS (NO CSS FILE CHANGES)
====================================================== */
function ensureInlineMessage(form) {
  if (!form) return null;

  let box = form.querySelector(".be-auth-inline-message");
  if (box) return box;

  box = document.createElement("div");
  box.className = "be-auth-inline-message";
  box.style.display = "none";
  box.style.margin = "10px 0";
  box.style.padding = "10px 12px";
  box.style.borderRadius = "10px";
  box.style.fontSize = "13px";
  box.style.lineHeight = "1.35";
  box.style.border = "1px solid rgba(255,255,255,0.10)";

  // Place message at the top of the form (safe, minimal)
  form.insertBefore(box, form.firstChild);
  return box;
}

function setInlineMessage(form, type, text) {
  const box = ensureInlineMessage(form);
  if (!box) return;

  if (!text) {
    box.textContent = "";
    box.style.display = "none";
    return;
  }

  box.textContent = text;
  box.style.display = "block";

  if (type === "error") {
    box.style.background = "rgba(255, 77, 79, 0.12)";
    box.style.borderColor = "rgba(255, 77, 79, 0.35)";
  } else if (type === "success") {
    box.style.background = "rgba(82, 196, 26, 0.12)";
    box.style.borderColor = "rgba(82, 196, 26, 0.35)";
  } else {
    box.style.background = "rgba(255,255,255,0.06)";
    box.style.borderColor = "rgba(255,255,255,0.10)";
  }
}

function getEmailInput(form) {
  return (
    form.querySelector('input[name="email"]') ||
    form.querySelector('input[type="email"]') ||
    form.querySelector('input#email') ||
    form.querySelector('input#login-email')
  );
}

function getPasswordInput(form) {
  return (
    form.querySelector('input[name="password"]') ||
    form.querySelector('input[type="password"]') ||
    form.querySelector('input#password') ||
    form.querySelector('input#login-password')
  );
}

function getUsernameInput(form) {
  return (
    form.querySelector('input[name="username"]') ||
    form.querySelector('input#username') ||
    form.querySelector('input#register-username')
  );
}

function clearLoginFields(form) {
  const emailEl = getEmailInput(form);
  const passEl = getPasswordInput(form);
  if (emailEl) emailEl.value = "";
  if (passEl) passEl.value = "";
  if (emailEl) emailEl.focus();
}

function setBusy(form, isBusy) {
  if (!form) return;
  const btns = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]'));
  btns.forEach((b) => {
    b.disabled = !!isBusy;
    if (isBusy) b.dataset.bePrevDisabled = "1";
  });
  form.dataset.beBusy = isBusy ? "1" : "0";
}

function isBusy(form) {
  return form?.dataset?.beBusy === "1";
}

/* ======================================================
   AUTH UI STATE BINDING (HEADER + MOBILE ACCOUNT)
====================================================== */
function applyAuthState(state) {
  const isAuthed = !!state?.authenticated;

  /* Toggle auth triggers (desktop + mobile) */
  const loginBtns = document.querySelectorAll(".btn-auth.login, .menu-auth-login");
  const registerBtns = document.querySelectorAll(".btn-auth.register, .menu-auth-register");

  loginBtns.forEach((el) => {
    el.style.display = isAuthed ? "none" : "";
  });
  registerBtns.forEach((el) => {
    el.style.display = isAuthed ? "none" : "";
  });

  /* MOBILE ACCOUNT SECTION: Guest ↔ User + username + logout */
  const mobileAccount =
    qs(".mobile-menu-panel .menu-section.account") || qs(".menu-section.account");
  if (mobileAccount) {
    const guestBox = qs(".mobile-auth-guest", mobileAccount);
    const userBox = qs(".mobile-auth-user", mobileAccount);

    if (guestBox) guestBox.hidden = isAuthed;
    if (userBox) userBox.hidden = !isAuthed;

    if (isAuthed && userBox) {
      const usernameEl = qs(".username", userBox);
      const uname = state?.user?.username || "";
      if (usernameEl) usernameEl.textContent = uname;

      const logoutLink = qs(".logout", userBox);
      if (logoutLink && !logoutLink.dataset.beLogoutBound) {
        logoutLink.dataset.beLogoutBound = "1";
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          window.BEAuth?.clearAuth?.();
        });
      }
    }
  }
}

function hydrateAuthUI() {
  if (window.BEAuth?.getState) {
    applyAuthState(window.BEAuth.getState());
  }
}

/* React to auth state changes */
document.addEventListener("auth:changed", (e) => {
  applyAuthState(e.detail);
});

/* ======================================================
   FORM SUBMIT HANDLING (LOGIN / REGISTER / FORGOT)
   - Uses BEAuthAPI (cookie session)
   - Bubble phase so we can skip if another handler already prevented default
====================================================== */
function initAuthFormHandlers() {
  if (document.documentElement.dataset.beAuthFormsInit === "1") return;
  document.documentElement.dataset.beAuthFormsInit = "1";

  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const loginModal = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");

    const isInLogin = !!(loginModal && loginModal.contains(form));
    const isInRegister = !!(registerModal && registerModal.contains(form));

    if (!isInLogin && !isInRegister) return;

    // If another script already owns this submit, do nothing.
    if (e.defaultPrevented) return;

    // Require API client
    const API = window.BEAuthAPI || window.BEAuthApi;
    if (!API) return;

    // Prevent native submit navigation
    e.preventDefault();

    // Avoid double submit spam
    if (isBusy(form)) return;

    // Clear any previous message
    setInlineMessage(form, "info", "");

    const closeAll = typeof window.BE_closeAuthModals === "function" ? window.BE_closeAuthModals : null;

    const emailEl = getEmailInput(form);
    const passEl = getPasswordInput(form);
    const userEl = getUsernameInput(form);

    const email = String(emailEl?.value || "").trim();
    const password = String(passEl?.value || "");
    const username = String(userEl?.value || "").trim();

    try {
      setBusy(form, true);

      // Determine intent: forgot form vs login form (inside login modal)
      const loginForgotOpen = !!(loginModal && loginModal.classList.contains("state-forgot-open"));
      const isForgot =
        isInLogin &&
        loginForgotOpen &&
        // forgot forms typically have no password field
        !form.querySelector('input[type="password"]');

      if (isForgot) {
        await API.forgotPassword({ email });
        setInlineMessage(
          form,
          "success",
          "If the email exists, you will receive password reset instructions."
        );
        return;
      }

      if (isInRegister) {
        // REGISTER
        await API.register({ username, email, password });

        // Hydrate state from /me and broadcast to UI
        const me = await API.me();
        document.dispatchEvent(new CustomEvent("auth:changed", { detail: me || {} }));

        if (closeAll) closeAll();
        form.reset?.();
        return;
      }

      // LOGIN
      await API.login({ email, password });

      // Hydrate state from /me and broadcast to UI
      const me = await API.me();
      document.dispatchEvent(new CustomEvent("auth:changed", { detail: me || {} }));

      if (closeAll) closeAll();
      form.reset?.();
    } catch (err) {
      const status = Number(err?.status || 0);
      const code = String(err?.code || "");

      // Requirement: on wrong credentials show message + clear email/password
      if (status === 401 && code === "INVALID_CREDENTIALS") {
        setInlineMessage(form, "error", "Invalid email or password.");
        clearLoginFields(form);
        return;
      }

      // Generic error fallback
      const msg =
        String(err?.message || "").trim() ||
        (status ? `Request failed (HTTP ${status})` : "Request failed");
      setInlineMessage(form, "error", msg);
    } finally {
      setBusy(form, false);
    }
  });
}

/* =======================
   EVENT BINDING
======================= */
document.addEventListener("headerLoaded", () => {
  initAuth();
  initAuthFormHandlers();
  hydrateAuthUI();
});

/* Fallback for late load */
if (window.__BE_HEADER_READY__ === true) {
  initAuth();
  initAuthFormHandlers();
  hydrateAuthUI();
}

/* Safe eager hydrate (no-op until elements exist) */
hydrateAuthUI();
initAuthFormHandlers();
```0
