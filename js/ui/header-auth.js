/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v6.1)
 * Single source of truth for Login / Register / Forgot
 *
 * ENTERPRISE FIX:
 * - Robust binding for multiple triggers
 * - Mobile menu close before opening auth modals
 * - Auth UI hydration to prevent initial state desync
 * - Mobile Account section Guest ↔ User sync (username + logout)
 * - Event delegation for Forgot Password
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
    const overlay  = qs(".mobile-menu-overlay");

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

    const loginModal    = qs("#login-modal");
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
    [loginModal, registerModal].forEach(modal => {
        on(modal.querySelector(".auth-close"), "click", closeAll);
        on(modal, "click", (e) => {
            if (e.target === modal) closeAll();
        });
    });

    /* Switch login ↔ register */
    document.querySelectorAll(".auth-switch").forEach(btn => {
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
   AUTH UI STATE BINDING (HEADER + MOBILE ACCOUNT)
====================================================== */
function applyAuthState(state) {
    const isAuthed = !!state?.authenticated;

    /* Toggle auth triggers (desktop + mobile) */
    const loginBtns = document.querySelectorAll(".btn-auth.login, .menu-auth-login");
    const registerBtns = document.querySelectorAll(".btn-auth.register, .menu-auth-register");

    loginBtns.forEach(el => { el.style.display = isAuthed ? "none" : ""; });
    registerBtns.forEach(el => { el.style.display = isAuthed ? "none" : ""; });

    /* MOBILE ACCOUNT SECTION: Guest ↔ User + username + logout */
    const mobileAccount = qs(".mobile-menu-panel .menu-section.account") || qs(".menu-section.account");
    if (mobileAccount) {
        const guestBox = qs(".mobile-auth-guest", mobileAccount);
        const userBox  = qs(".mobile-auth-user", mobileAccount);

        if (guestBox) guestBox.hidden = isAuthed;
        if (userBox)  userBox.hidden  = !isAuthed;

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

/* =======================
   EVENT BINDING
======================= */
document.addEventListener("headerLoaded", () => {
    initAuth();
    hydrateAuthUI();
});

/* Fallback for late load */
if (window.__BE_HEADER_READY__ === true) {
    initAuth();
    hydrateAuthUI();
}

/* Safe eager hydrate (no-op until elements exist) */
hydrateAuthUI();
