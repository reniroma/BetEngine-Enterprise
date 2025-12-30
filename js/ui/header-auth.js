/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v6.1)
 * Single source of truth for Login / Register / Forgot
 *
 * RESPONSIBILITY:
 * - Open / close Login modal
 * - Open / close Register modal
 * - Handle Forgot Password UI
 *
 * DOES NOT:
 * - React to auth:changed
 * - Hide / show login-register
 * - Touch header UI state
 *********************************************************/

/* =======================
   UTILS
======================= */
const qs = (sel, scope = document) => scope.querySelector(sel);
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
    on(qs(".btn-auth.login"), "click", (e) => {
        e.preventDefault();
        openLogin();
    });

    on(qs(".btn-auth.register"), "click", (e) => {
        e.preventDefault();
        openRegister();
    });

    /* Mobile menu buttons */
    on(qs(".menu-auth-login"), "click", (e) => {
        e.preventDefault();
        openLogin();
    });

    on(qs(".menu-auth-register"), "click", (e) => {
        e.preventDefault();
        openRegister();
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

/* =======================
   EVENT BINDING
======================= */
document.addEventListener("headerLoaded", initAuth);

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
    initAuth();
}
