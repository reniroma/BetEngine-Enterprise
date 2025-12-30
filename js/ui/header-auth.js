/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v6.0)
 * Single source of truth for Login / Register / Forgot
 *
 * ENTERPRISE FIX:
 * - Event delegation for Forgot Password
 * - Works with dynamically injected header + modals
 * - ZERO HTML / CSS assumptions
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

    const closeMobileMenuIfOpen = () => {
        // Prefer existing mobile handlers (header-mobile.js) to preserve behavior
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
    };

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

    /* Desktop header buttons */
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

    /* Mobile menu buttons */
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
   ENTERPRISE FIX — FORGOT PASSWORD (EVENT DELEGATION)
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
   AUTH UI STATE BINDING (HEADER)
   PATCH IMPLEMENTED – DO NOT MODIFY
====================================================== */
function applyAuthState(state) {
    const loginBtns = document.querySelectorAll(
        ".btn-auth.login, .menu-auth-login"
    );
    const registerBtns = document.querySelectorAll(
        ".btn-auth.register, .menu-auth-register"
    );

    loginBtns.forEach(el => {
        el.style.display = state.authenticated ? "none" : "";
    });

    registerBtns.forEach(el => {
        el.style.display = state.authenticated ? "none" : "";
    });
}

function hydrateAuthUI() {
    if (window.BEAuth?.getState) {
        applyAuthState(window.BEAuth.getState());
    }
}

// React to auth state changes
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

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
    initAuth();
    hydrateAuthUI();
}

// Safe eager hydrate (no-op until elements exist)
hydrateAuthUI();
