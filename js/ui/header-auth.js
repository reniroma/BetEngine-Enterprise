/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (2 MODALS)
 * Login + Register (separate overlays)
 * FINAL v2.0 – enterprise-safe init
 *
 * Fixes:
 * - Works even if headerLoaded fired before this script loads
 * - Prevents double-binding
 *********************************************************/

(function () {

    const initAuth = () => {
        if (document.documentElement.dataset.beAuthInit === "1") return;
        document.documentElement.dataset.beAuthInit = "1";

        const loginModal    = document.getElementById("auth-login");
        const registerModal = document.getElementById("auth-register");

        const loginBtn      = document.querySelector(".btn-auth.login");
        const registerBtn   = document.querySelector(".btn-auth.register");

        if (!loginModal || !registerModal || !loginBtn || !registerBtn) return;

        const closeBtns  = document.querySelectorAll("[data-auth-close]");
        const switchBtns = document.querySelectorAll(".auth-switch");

        const open = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
        };

        const close = (modal) => {
            if (!modal) return;
            modal.classList.remove("show");
            document.body.style.overflow = "";
        };

        loginBtn.addEventListener("click", () => {
            close(registerModal);
            open(loginModal);
        });

        registerBtn.addEventListener("click", () => {
            close(loginModal);
            open(registerModal);
        });

        closeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                close(loginModal);
                close(registerModal);
            });
        });

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

        [loginModal, registerModal].forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) close(modal);
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (loginModal.classList.contains("show")) close(loginModal);
            if (registerModal.classList.contains("show")) close(registerModal);
        });

        console.log("Auth initialized (v2.0)");
    };

    // Init on headerLoaded (normal path)
    document.addEventListener("headerLoaded", initAuth);

    // Fallback init (if header already injected)
    window.addEventListener("load", () => {
        if (document.querySelector(".btn-auth.login") && document.getElementById("auth-login")) {
            initAuth();
        }
    });

})();
