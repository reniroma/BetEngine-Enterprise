/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v5.2)
 * Single source of truth for Login / Register overlays
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
   INIT AUTH
======================= */
function initAuth() {
    const loginOverlay    = qs("#login-modal");
    const registerOverlay = qs("#register-modal");

    if (!loginOverlay || !registerOverlay) return;

    /* ===============================
       FORGOT PASSWORD – STATE PATCH
       =============================== */
    const forgotBtn = loginOverlay.querySelector(".auth-forgot-link");

    if (forgotBtn) {
        forgotBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            loginOverlay.classList.add("state-forgot-open");
        });
    }
    /* ===== END PATCH ===== */

    const closeAll = () => {
        loginOverlay.classList.remove("show", "state-forgot-open");
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
    on(qs(".menu-auth-login"), "click", openLogin);
    on(qs(".menu-auth-register"), "click", openRegister);

    /* Close handlers */
    [loginOverlay, registerOverlay].forEach(overlay => {
        on(overlay.querySelector(".auth-close"), "click", closeAll);
        on(overlay, "click", (e) => {
            if (e.target === overlay) closeAll();
        });
    });

    /* Switch between modals */
    document.querySelectorAll(".auth-switch").forEach(btn => {
        on(btn, "click", () => {
            const target = btn.dataset.authTarget;
            if (target === "login") openLogin();
            if (target === "register") openRegister();
        });
    });

    /* ESC */
    document.addEventListener("keydown", (e) => {
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
}

/* =======================
   EVENT BINDING
======================= */
document.addEventListener("headerLoaded", initAuth);

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
    initAuth();
}
