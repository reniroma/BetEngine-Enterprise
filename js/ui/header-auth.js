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
      // Ensure fields reset if present
      clearLoginFieldsIn(scope);
    } catch (err) {
      const status = Number(err?.status || 0);
      const code = String(err?.code || "");

      if (status === 401 && code === "INVALID_CREDENTIALS") {
        setMessage(containerForMessage, "error", "Invalid email or password.");
        clearLoginFieldsIn(scope);
        return;
      }

      const msg =
        String(err?.message || "").trim() ||
        (status ? `Request failed (HTTP ${status})` : "Request failed");

      setMessage(containerForMessage, "error", msg);
    } finally {
      setBusy(scope, false);
    }
  };

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
      const status = Number(err?.status || 0);
      const msg =
        String(err?.message || "").trim() ||
        (status ? `Request failed (HTTP ${status})` : "Request failed");

      setMessage(containerForMessage, "error", msg);
    } finally {
      setBusy(scope, false);
    }
  };

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
      const status = Number(err?.status || 0);
      const msg =
        String(err?.message || "").trim() ||
        (status ? `Request failed (HTTP ${status})` : "Request failed");
      setMessage(containerForMessage, "error", msg);
    } finally {
      setBusy(scope, false);
    }
  };

  // CAPTURE submit ownership
  document.addEventListener(
    "submit",
    async (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;

      const loginModal = qs("#login-modal");
      const registerModal = qs("#register-modal");

      const inLogin = !!(loginModal && loginModal.contains(form));
      const inRegister = !!(registerModal && registerModal.contains(form));
      if (!inLogin && !inRegister) return;

      // Take full ownership
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

      if (inLogin) {
        const forgotOpen = loginModal.classList.contains("state-forgot-open");
        const hasPassword = !!findPassword(form);
        if (forgotOpen && !hasPassword) return runForgot(loginModal, form);
        return runLogin(loginModal, form);
      }

      return runRegister(registerModal, form);
    },
    true
  );

  // CAPTURE click ownership (handles non-submit buttons)
  document.addEventListener(
    "click",
    async (e) => {
      const loginModal = qs("#login-modal");
      const registerModal = qs("#register-modal");

      const target = e.target;
      if (!(target instanceof Element)) return;

      // Heuristics: any primary login button likely inside login modal
      const btn = target.closest('button, input[type="button"], input[type="submit"]');
      if (!btn) return;

      const inLogin = !!(loginModal && loginModal.classList.contains("show") && loginModal.contains(btn));
      const inRegister = !!(registerModal && registerModal.classList.contains("show") && registerModal.contains(btn));
      if (!inLogin && !inRegister) return;

      // Ignore close buttons & switches
      if (btn.closest(".auth-close, .auth-switch, .auth-forgot-link, .auth-forgot")) return;

      // Only intercept likely submit actions
      const isSubmitLike =
        btn.getAttribute("type") === "submit" ||
        btn.getAttribute("type") === "button" ||
        btn.matches(".auth-submit, .auth-login, .auth-register") ||
        /login/i.test(btn.textContent || "") ||
        /register/i.test(btn.textContent || "");

      if (!isSubmitLike) return;

      // If a form exists and would submit, submit handler covers it; however we still prevent duplicates
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

      if (inLogin) {
        const scope = btn.closest("form") || loginModal;
        const forgotOpen = loginModal.classList.contains("state-forgot-open");
        const hasPassword = !!findPassword(scope);
        if (forgotOpen && !hasPassword) return runForgot(loginModal, scope);
        return runLogin(loginModal, scope);
      }

      if (inRegister) {
        const scope = btn.closest("form") || registerModal;
        return runRegister(registerModal, scope);
      }
    },
    true
  );
}

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
