/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v3.0)
 * Single source of truth for Login / Register modals
 * SAFE:
 * - No global document click killers
 * - Works with header-loader.js
 * - Works on desktop & mobile
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ==================================================
       HELPERS
    ================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    /* ==================================================
       ELEMENTS
    ================================================== */
    const loginBtn    = qs(".btn-auth.login");
    const registerBtn = qs(".btn-auth.register");

    const loginWrap   = qs("#auth-login-container");
    const registerWrap = qs("#auth-register-container");

    if (!loginWrap || !registerWrap) {
        console.warn("[AUTH] Containers missing");
        return;
    }

    /* ==================================================
       STATE
    ================================================== */
    const closeAll = () => {
        loginWrap.classList.remove("show");
        registerWrap.classList.remove("show");
        document.body.style.overflow = "";
    };

    const openLogin = () => {
        closeAll();
        loginWrap.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const openRegister = () => {
        closeAll();
        registerWrap.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    /* ==================================================
       BUTTON TRIGGERS (DESKTOP + MOBILE)
    ================================================== */
    on(loginBtn, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLogin();
    });

    on(registerBtn, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openRegister();
    });

    /* ==================================================
       CLOSE BUTTONS INSIDE MODALS
    ================================================== */
    [loginWrap, registerWrap].forEach(modal => {

        // Close icon
        on(modal.querySelector(".auth-close"), "click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAll();
        });

        // Click on overlay only
        on(modal, "click", (e) => {
            if (e.target === modal) closeAll();
        });
    });

    /* ==================================================
       ESC KEY
    ================================================== */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });

    /* ==================================================
       EXPOSE API (for mobile if needed)
    ================================================== */
    window.BE_openLogin = openLogin;
    window.BE_openRegister = openRegister;

    console.log("header-auth.js v3.0 READY");
});
