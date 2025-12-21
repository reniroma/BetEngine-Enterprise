/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v5.2)
 * Single source of truth for Login / Register overlays
 * FIX: Forgot Password (inline, same modal, mobile-only UI)
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
    // Prevent double-binding if headerLoaded fires more than once
    if (document.documentElement.dataset.beAuthInit === "1") return;
    document.documentElement.dataset.beAuthInit = "1";

    const loginOverlay = qs("#login-modal");
    const registerOverlay = qs("#register-modal");

    if (!loginOverlay || !registerOverlay) return;

    /* =======================
       FORGOT PASSWORD (INLINE)
       - Reuse SAME login modal container
       - Works with either .auth-forgot or .auth-forgot-link
       - CSS owner: #login-modal.state-forgot-open .auth-forgot-section { display:block; }
    ======================= */
    const loginForm = loginOverlay.querySelector(".auth-form");
    const forgotSection = loginOverlay.querySelector(".auth-forgot-section");

    // Support both class names (project history has both variants)
    const forgotBtn =
        loginOverlay.querySelector(".auth-forgot-link") ||
        loginOverlay.querySelector(".auth-forgot");

    // Optional "back" link/button if you add it later (no requirement)
    const backBtn =
        loginOverlay.querySelector(".back-to-login") ||
        loginOverlay.querySelector(".auth-back-login");

    const openForgotInline = (e) => {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
        if (e && typeof e.stopPropagation === "function") e.stopPropagation();

        if (!loginForm || !forgotSection) return;

        // Toggle state (CSS-driven visibility)
        loginOverlay.classList.add("state-forgot-open");
        forgotSection.setAttribute("aria-hidden", "false");

        // Safety: hide login form explicitly (even if CSS changes later)
        loginForm.style.display = "none";
        forgotSection.style.display = "";

        // Keep body locked because overlay remains open
        lockBody(true);
    };

    const resetForgotInline = () => {
        loginOverlay.classList.remove("state-forgot-open");

        if (loginForm) loginForm.style.display = "";
        if (forgotSection) {
            forgotSection.style.display = "";
            forgotSection.setAttribute("aria-hidden", "true");
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

    /* Forgot trigger (inside login modal) */
    on(forgotBtn, "click", openForgotInline);

    /* Optional back-to-login (if exists) */
    on(backBtn, "click", (e) => {
        if (e && e.preventDefault) e.preventDefault();
        resetForgotInline();
        lockBody(true);
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
    document.querySelectorAll(".auth-switch").forEach((btn) => {
        on(btn, "click", (e) => {
            if (e && e.preventDefault) e.preventDefault();
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
