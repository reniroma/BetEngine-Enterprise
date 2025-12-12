/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v4.0)
 * Single source of truth for Login / Register modals
 * FIXED:
 * - Correct modal IDs
 * - Desktop & Mobile compatible
 * - No hamburger interference
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ==================================================
       HELPERS
    ================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    /* ==================================================
       ELEMENTS (CORRECT IDS)
    ================================================== */
    const loginBtn    = qs(".btn-auth.login");
    const registerBtn = qs(".btn-auth.register");

    const loginModal    = qs("#login-modal");
    const registerModal = qs("#register-modal");

    if (!loginModal || !registerModal) {
        console.error("[AUTH] Login/Register modals not found in DOM");
        return;
    }

    /* ==================================================
       STATE CONTROL
    ================================================== */
    const closeAll = () => {
        loginModal.classList.remove("show");
        registerModal.classList.remove("show");
        document.body.style.overflow = "";
    };

    const openLogin = () => {
        closeAll();
        loginModal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const openRegister = () => {
        closeAll();
        registerModal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    /* ==================================================
       TRIGGERS (DESKTOP + MOBILE)
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
       CLOSE HANDLERS
    ================================================== */
    [loginModal, registerModal].forEach(modal => {

        // Close button
        on(modal.querySelector(".auth-close"), "click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAll();
        });

        // Click outside modal box
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
       PUBLIC API (USED BY MOBILE MENU)
    ================================================== */
    window.BE_openLogin = openLogin;
    window.BE_openRegister = openRegister;

    console.log("header-auth.js v4.0 READY");
});
