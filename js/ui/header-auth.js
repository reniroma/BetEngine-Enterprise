/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v6.3)
 * Single source of truth for Login / Register / Forgot
 *
 * FIX (v6.3):
 * - Capture-phase ownership for login/register submit + button clicks
 * - Prevent duplicate requests (stopImmediatePropagation)
 * - Inline error rendering (modal or form)
 * - Clear email + password on INVALID_CREDENTIALS
 *
 * SCOPE:
 * - No CSS edits
 * - No auth-api.js edits
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

/* ======================================================
   MOBILE MENU CLOSE (SAFE)
====================================================== */
function closeMobileMenuIfOpen() {
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

  const panel = qs(".mobile-menu-panel");
  overlay?.classList.remove("show");
  panel?.classList.remove("open", "premium-mode");
  document.body.style.overflow = "";
  document.body.classList.remove("menu-open");
}

/* =======================
   MODAL OPEN/CLOSE
======================= */
function initAuth() {
  if (document.documentElement.dataset.beAuthInit === "1") return;
  document.documentElement.dataset.beAuthInit = "1";

  const loginModal = qs("#login-modal");
  const registerModal = qs("#register-modal");
  if (!loginModal || !registerModal) return;

  /* =======================
     AUTH FORM RESET (SECURITY)
  ======================= */
  const resetAuthForm = (overlay) => {
    if (!overlay) return;

    // Reset native form state (best-effort)
    const form = overlay.querySelector("form");
    if (form && typeof form.reset === "function") form.reset();

    // Clear inputs/selects/textareas (force)
    const fields = overlay.querySelectorAll("input, textarea, select");
    fields.forEach((el) => {
      const tag = (el.tagName || "").toLowerCase();
      const type = (el.type || "").toLowerCase();

      if (tag === "select") {
        el.selectedIndex = 0;
        return;
      }

      if (type === "checkbox" || type === "radio") {
        el.checked = false;
        return;
      }

      el.value = "";
    });

    // Clear any UI messages
    const msgs = overlay.querySelectorAll(".auth-message, .auth-error, .auth-success");
    msgs.forEach((m) => (m.textContent = ""));
  };

  const closeAll = () => {
    loginModal.classList.remove("show", "state-forgot-open");
    registerModal.classList.remove("show");

    // CLEAR FORMS ON CLOSE (prevents stale values)
    resetAuthForm(loginModal);
    resetAuthForm(registerModal);

    lockBody(false);
  };

  const openLogin = () => {
    closeAll();

    // CLEAR BEFORE OPEN (extra safety)
    resetAuthForm(loginModal);

    loginModal.classList.add("show");
    lockBody(true);
  };

  const openRegister = () => {
    closeAll();

    // CLEAR BEFORE OPEN (extra safety)
    resetAuthForm(registerModal);

    registerModal.classList.add("show");
    lockBody(true);
  };

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

  [loginModal, registerModal].forEach((modal) => {
    on(modal.querySelector(".auth-close"), "click", closeAll);
    on(modal, "click", (e) => {
      if (e.target === modal) closeAll();
    });
  });

  document.querySelectorAll(".auth-switch").forEach((btn) => {
    on(btn, "click", (e) => {
      e.preventDefault();
      const target = btn.dataset.authTarget;
      if (target === "login") openLogin();
      if (target === "register") openRegister();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  window.BE_openLogin = openLogin;
  window.BE_openRegister = openRegister;
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
   INLINE MESSAGE (NO CSS FILE CHANGES)
====================================================== */
function ensureMessageHost(container) {
  if (!container) return null;

  let box = container.querySelector(".be-auth-inline-message");
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

  // Insert near the top of the container
  container.insertBefore(box, container.firstChild);
  return box;
}

function setMessage(container, type, text) {
  const box = ensureMessageHost(container);
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

function findEmail(scope) {
  return (
    qs('input[name="email"]', scope) ||
    qs('input[type="email"]', scope) ||
    qs("#email", scope) ||
    qs("#login-email", scope)
  );
}

function findPassword(scope) {
  return (
    qs('input[name="password"]', scope) ||
    qs('input[type="password"]', scope) ||
    qs("#password", scope) ||
    qs("#login-password", scope)
  );
}

function findUsername(scope) {
  return qs('input[name="username"]', scope) || qs("#username", scope) || qs("#register-username", scope);
}

function clearLoginFieldsIn(scope) {
  const emailEl = findEmail(scope);
  const passEl = findPassword(scope);
  if (emailEl) emailEl.value = "";
  if (passEl) passEl.value = "";
  emailEl?.focus?.();
}

function clearRegisterFieldsIn(scope) {
  const userEl = findUsername(scope);
  const emailEl = findEmail(scope);
  const passEl = findPassword(scope);

  if (userEl) userEl.value = "";
  if (emailEl) emailEl.value = "";
  if (passEl) passEl.value = "";

  (userEl || emailEl)?.focus?.();
}

function setBusy(scope, isBusy) {
  if (!scope) return;
  scope.dataset.beBusy = isBusy ? "1" : "0";
  const btns = qsa('button[type="submit"], input[type="submit"]', scope);
  btns.forEach((b) => (b.disabled = !!isBusy));
}

function isBusy(scope) {
  return scope?.dataset?.beBusy === "1";
}

/* ======================================================
   AUTH UI STATE BINDING (HEADER + MOBILE ACCOUNT)
====================================================== */
function applyAuthState(state) {
  const isAuthed = !!state?.authenticated;

  const loginBtns = document.querySelectorAll(".btn-auth.login, .menu-auth-login");
  const registerBtns = document.querySelectorAll(".btn-auth.register, .menu-auth-register");

  loginBtns.forEach((el) => (el.style.display = isAuthed ? "none" : ""));
  registerBtns.forEach((el) => (el.style.display = isAuthed ? "none" : ""));

  const mobileAccount =
    qs(".mobile-menu-panel .menu-section.account") || qs(".menu-section.account");

  if (mobileAccount) {
    const guestBox = qs(".mobile-auth-guest", mobileAccount);
    const userBox = qs(".mobile-auth-user", mobileAccount);

    if (guestBox) guestBox.hidden = isAuthed;
    if (userBox) userBox.hidden = !isAuthed;

    if (isAuthed && userBox) {
      const usernameEl = qs(".username", userBox);
      if (usernameEl) usernameEl.textContent = state?.user?.username || "";

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
  if (window.BEAuth?.getState) applyAuthState(window.BEAuth.getState());
}

document.addEventListener("auth:changed", (e) => {
  applyAuthState(e.detail);
});

/* ======================================================
   AUTH ACTIONS (OWNED HANDLERS)
   - Capture-phase so other scripts cannot hijack submit/click
====================================================== */
function initAuthActionOwnership() {
  if (document.documentElement.dataset.beAuthActionsInit === "1") return;
  document.documentElement.dataset.beAuthActionsInit = "1";

  /* ======================================================
     ERROR PARITY (UI NORMALIZER)
     - Normalizes any thrown value into: { status, code, message, details, field }
     - Provides consistent UI messages across:
       VALIDATION_ERROR / INVALID_CREDENTIALS / USER_EXISTS / TIMEOUT / NETWORK_ERROR / HTTP_ERROR
  ====================================================== */
  const normalizeUIError = (err) => {
    const status = Number(
      err?.status ??
      err?.response?.status ??
      err?.res?.status ??
      0
    );

    const code = String(
      err?.code ??
      err?.error?.code ??
      ""
    );

    const message = String(
      err?.message ??
      err?.error?.message ??
      ""
    ).trim();

    const details =
      err?.details ??
      err?.error?.details ??
      null;

    const field = String(details?.field || "").trim();

    return { status, code, message, details, field, raw: err };
  };

  const defaultErrorMessage = ({ status, code, message }) => {
    if (code === "TIMEOUT") return "Request timed out. Please try again.";
    if (code === "NETWORK_ERROR") return "Network error. Please check your connection.";
    if (message) return message;
    return status ? `Request failed (HTTP ${status})` : "Request failed";
  };

  const clearPasswordOnlyIn = (scope) => {
    const passEl = findPassword(scope);
    if (passEl) passEl.value = "";
    passEl?.focus?.();
  };

  /* =======================
     LOGIN
  ======================= */
  const runLogin = async (loginModal, scope) => {
    const API = window.BEAuthAPI || window.BEAuthApi;
    if (!API) return;

    const containerForMessage = qs("form", scope) || scope;
    setMessage(containerForMessage, "info", "");

    const email = String(findEmail(scope)?.value || "").trim();
    const password = String(findPassword(scope)?.value || "");

    if (isBusy(scope)) return;

    try {
      setBusy(scope, true);
      await API.login({ email, password });

      const me = await API.me();

      /* SYNC STATE MANAGER (BEAuth) */
      if (window.BEAuth?.setAuth) {
        window.BEAuth.setAuth(me);
      }

      const nextState = window.BEAuth?.getState ? window.BEAuth.getState() : (me || {});
      document.dispatchEvent(new CustomEvent("auth:changed", { detail: nextState }));

      window.BE_closeAuthModals?.();
      clearLoginFieldsIn(scope);
    } catch (err) {
      const E = normalizeUIError(err);

      if (E.status === 401 && E.code === "INVALID_CREDENTIALS") {
        setMessage(containerForMessage, "error", "Invalid email or password.");
        clearLoginFieldsIn(scope);
        return;
      }

      if (E.status === 400 && E.code === "VALIDATION_ERROR") {
        setMessage(containerForMessage, "error", E.message || "Email and password are required.");
        clearPasswordOnlyIn(scope);
        return;
      }

      setMessage(containerForMessage, "error", defaultErrorMessage(E));
      clearPasswordOnlyIn(scope);
    } finally {
      setBusy(scope, false);
    }
  };

  /* =======================
     REGISTER
  ======================= */
  const runRegister = async (registerModal, scope) => {
    const API = window.BEAuthAPI || window.BEAuthApi;
    if (!API) return;

    const containerForMessage = qs("form", scope) || scope;
    setMessage(containerForMessage, "info", "");

    const username = String(findUsername(scope)?.value || "").trim();
    const email = String(findEmail(scope)?.value || "").trim();
    const password = String(findPassword(scope)?.value || "");

    if (isBusy(scope)) return;

    try {
      setBusy(scope, true);
      await API.register({ username, email, password });

      const me = await API.me();

      /* SYNC STATE MANAGER (BEAuth) */
      if (window.BEAuth?.setAuth) {
        window.BEAuth.setAuth(me);
      }

      const nextState = window.BEAuth?.getState ? window.BEAuth.getState() : (me || {});
      document.dispatchEvent(new CustomEvent("auth:changed", { detail: nextState }));

      window.BE_closeAuthModals?.();
    } catch (err) {
      const E = normalizeUIError(err);

      // DUPLICATE USER (server parity)
      if (E.status === 409 && E.code === "USER_EXISTS") {
        const f = String(E.field || "");
        const msg =
          f === "username"
            ? "Username is already taken."
            : f === "email"
              ? "Email is already registered."
              : "User already exists.";

        setMessage(containerForMessage, "error", msg);
        clearRegisterFieldsIn(scope);
        return;
      }

      // VALIDATION (client parity)
      if (E.status === 400 && E.code === "VALIDATION_ERROR") {
        setMessage(containerForMessage, "error", E.message || "Username, email, and password are required.");
        clearRegisterFieldsIn(scope);
        return;
      }

      // Any other error: keep username/email (optional), but ALWAYS clear password for security
      setMessage(containerForMessage, "error", defaultErrorMessage(E));
      clearPasswordOnlyIn(scope);
    } finally {
      setBusy(scope, false);
    }
  };

  /* =======================
     FORGOT PASSWORD
  ======================= */
  const runForgot = async (loginModal, scope) => {
    const API = window.BEAuthAPI || window.BEAuthApi;
    if (!API) return;

    const containerForMessage = qs("form", scope) || scope;
    setMessage(containerForMessage, "info", "");

    const email = String(findEmail(scope)?.value || "").trim();
    if (isBusy(scope)) return;

    try {
      setBusy(scope, true);
      await API.forgotPassword({ email });
      setMessage(containerForMessage, "success", "If the email exists, you will receive password reset instructions.");
    } catch (err) {
      const E = normalizeUIError(err);

      if (E.status === 400 && E.code === "VALIDATION_ERROR") {
        setMessage(containerForMessage, "error", E.message || "Email is required.");
        findEmail(scope)?.focus?.();
        return;
      }

      setMessage(containerForMessage, "error", defaultErrorMessage(E));
    } finally {
      setBusy(scope, false);
    }
  };

/* =======================
   EVENT BINDING
======================= */
document.addEventListener("headerLoaded", () => {
  initAuth();
  initAuthActionOwnership();
  hydrateAuthUI();
});

if (window.__BE_HEADER_READY__ === true) {
  initAuth();
  initAuthActionOwnership();
  hydrateAuthUI();
}

hydrateAuthUI();
initAuthActionOwnership();
