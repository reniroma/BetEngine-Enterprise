/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v4.1)
 * Single source of truth for Login / Register modals
 * Desktop + Mobile SAFE PATCH
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ==================================================
       HELPERS
    ================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    /* ==================================================
       ELEMENTS
    ================================================== */
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
       TRIGGERS – DESKTOP
    ================================================== */
    on(qs(".btn-auth.login"), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLogin();
    });

    on(qs(".btn-auth.register"), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openRegister();
    });

    /* ==================================================
       TRIGGERS – MOBILE (PATCH)
    ================================================== */
    qa(".menu-auth-login").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLogin();
        });
    });

    qa(".menu-auth-register").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openRegister();
        });
    });

    /* ==================================================
       CLOSE HANDLERS
    ================================================== */
    [loginModal, registerModal].forEach(modal => {

        on(modal.querySelector(".auth-close"), "click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeAll();
        });

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
       PUBLIC API
    ================================================== */
    window.BE_openLogin = openLogin;
    window.BE_openRegister = openRegister;

    console.log("header-auth.js v4.1 READY");
});
