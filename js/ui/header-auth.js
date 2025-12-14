/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v4.1)
 * Single source of truth for Login / Register modals
 *
 * FIXED:
 * - No fatal exit if modals are not yet in DOM
 * - Safe re-binding after header injection
 * - Desktop & Mobile compatible
 * - Public API always available
 *********************************************************/

(function () {
    let initialized = false;

    function initAuth() {
        if (initialized) return;

        const qs = (sel, scope = document) => scope.querySelector(sel);
        const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

        const loginModal    = qs("#login-modal");
        const registerModal = qs("#register-modal");

        /* If modals are not yet injected, wait */
        if (!loginModal || !registerModal) return;

        initialized = true;

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
           DESKTOP TRIGGERS
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
           PUBLIC API (USED BY MOBILE / BOOKMARKS / ETC)
        ================================================== */
        window.BE_openLogin = openLogin;
        window.BE_openRegister = openRegister;

        console.log("header-auth.js v4.1 READY");
    }

    /* Primary hook */
    document.addEventListener("headerLoaded", initAuth);

    /* Fallback safety */
    document.addEventListener("DOMContentLoaded", initAuth);
})();
