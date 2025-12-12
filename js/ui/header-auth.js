/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (2 MODALS)
 * Login + Register (separate overlays)
 * FINAL: Works even if headerLoaded already fired
 *********************************************************/

(function () {

    function initAuth() {

        const loginModal    = document.getElementById("auth-login");
        const registerModal = document.getElementById("auth-register");

        // Desktop triggers
        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");

        // Mobile triggers (inside hamburger panel)
        const mobileLoginBtn    = document.querySelector(".menu-auth-login");
        const mobileRegisterBtn = document.querySelector(".menu-auth-register");

        if (!loginModal || !registerModal) {
            // Auth HTML not present (yet)
            return;
        }

        const loginBox    = loginModal.querySelector(".be-auth-box") || loginModal.firstElementChild;
        const registerBox = registerModal.querySelector(".be-auth-box") || registerModal.firstElementChild;

        const closeBtns  = document.querySelectorAll("[data-auth-close]");
        const switchBtns = document.querySelectorAll(".auth-switch");

        const lockScroll = (lock) => {
            document.body.style.overflow = lock ? "hidden" : "";
        };

        const open = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
            lockScroll(true);
        };

        const close = (modal) => {
            if (!modal) return;
            modal.classList.remove("show");
            lockScroll(false);
        };

        // Prevent double-binding (important if initAuth runs multiple times)
        if (window.__BE_AUTH_BOUND__) return;
        window.__BE_AUTH_BOUND__ = true;

        // Desktop open
        loginBtn?.addEventListener("click", () => {
            close(registerModal);
            open(loginModal);
        });

        registerBtn?.addEventListener("click", () => {
            close(loginModal);
            open(registerModal);
        });

        // Mobile open (from hamburger)
        mobileLoginBtn?.addEventListener("click", () => {
            close(registerModal);
            open(loginModal);
        });

        mobileRegisterBtn?.addEventListener("click", () => {
            close(loginModal);
            open(registerModal);
        });

        // Close buttons (X)
        closeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                close(loginModal);
                close(registerModal);
            });
        });

        // Switch Login <-> Register
        switchBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.authTarget;
                if (target === "login") {
                    close(registerModal);
                    open(loginModal);
                } else if (target === "register") {
                    close(loginModal);
                    open(registerModal);
                }
            });
        });

        // Prevent clicks inside modal box from closing overlay
        loginBox?.addEventListener("click", (e) => e.stopPropagation());
        registerBox?.addEventListener("click", (e) => e.stopPropagation());

        // Close only on overlay click
        [loginModal, registerModal].forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) close(modal);
            });
        });

        // ESC closes
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (loginModal.classList.contains("show")) close(loginModal);
                if (registerModal.classList.contains("show")) close(registerModal);
            }
        });

        console.log("[AUTH] initialized");
    }

    // 1) Try immediately (for cases where header already injected)
    document.addEventListener("DOMContentLoaded", () => {
        initAuth();
        // 2) Also re-try on headerLoaded (for dynamic injection)
        document.addEventListener("headerLoaded", initAuth);
    });

})();
