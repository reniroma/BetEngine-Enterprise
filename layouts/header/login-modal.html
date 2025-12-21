```javascript
/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v5.3)
 * Optimized for Login / Register / Forgot Password
 *********************************************************/

const qs = (sel, scope = document) => scope.querySelector(sel);
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

const lockBody = (lock) => {
    document.body.style.overflow = lock ? "hidden" : "";
};

function initAuth() {
    const loginOverlay    = qs("#login-modal");
    const registerOverlay = qs("#register-modal");

    if (!loginOverlay || !registerOverlay) return;

    const loginForm     = loginOverlay.querySelector(".auth-form");
    const forgotBtn     = loginOverlay.querySelector(".auth-forgot");
    const forgotSection = loginOverlay.querySelector(".auth-forgot-section");
    const backBtn       = loginOverlay.querySelector(".back-to-login");

    /* --- FORGOT PASSWORD LOGIC --- */
    if (forgotBtn && forgotSection && loginForm) {
        on(forgotBtn, "click", (e) => {
            e.preventDefault();
            loginOverlay.classList.add("state-forgot-open");
            loginForm.style.display = "none";
            forgotSection.style.display = "block";
            forgotSection.setAttribute("aria-hidden", "false");
        });
    }

    if (backBtn) {
        on(backBtn, "click", (e) => {
            e.preventDefault();
            loginOverlay.classList.remove("state-forgot-open");
            loginForm.style.display = "flex";
            forgotSection.style.display = "none";
            forgotSection.setAttribute("aria-hidden", "true");
        });
    }

    /* --- COMMON HANDLERS --- */
    const closeAll = () => {
        loginOverlay.classList.remove("show", "state-forgot-open");
        registerOverlay.classList.remove("show");
        lockBody(false);

        // Reset to default state
        if (loginForm) loginForm.style.display = "";
        if (forgotSection) {
            forgotSection.style.display = "none";
            forgotSection.setAttribute("aria-hidden", "true");
        }
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

    /* --- EVENT BINDING --- */
    on(qs(".btn-auth.login"), "click", (e) => { e.preventDefault(); openLogin(); });
    on(qs(".btn-auth.register"), "click", (e) => { e.preventDefault(); openRegister(); });
    on(qs(".menu-auth-login"), "click", openLogin);
    on(qs(".menu-auth-register"), "click", openRegister);

    [loginOverlay, registerOverlay].forEach(overlay => {
        const closeBtn = overlay.querySelector(".auth-close");
        on(closeBtn, "click", closeAll);
        on(overlay, "click", (e) => {
            if (e.target === overlay) closeAll();
        });
    });

    document.querySelectorAll(".auth-switch").forEach(btn => {
        on(btn, "click", () => {
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
}

// Initialization
document.addEventListener("headerLoaded", initAuth);
if (window.__BE_HEADER_READY__ === true) {
    initAuth();
}
