/*********************************************************
 * BetEngine Enterprise – HEADER AUTH (FINAL v2.0)
 * FIXED:
 * - Safe init after headerLoaded
 * - Desktop auth works (login/register)
 * - Does NOT close hamburger or other menus
 * - Proper event isolation
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ===============================
       ELEMENT REFERENCES
    =============================== */
    const loginOverlay    = document.getElementById("auth-login");
    const registerOverlay = document.getElementById("auth-register");

    if (!loginOverlay || !registerOverlay) {
        console.warn("[Auth] Overlays not found");
        return;
    }

    const loginBtn    = document.querySelector(".btn-auth.login");
    const registerBtn = document.querySelector(".btn-auth.register");

    const closeBtns = document.querySelectorAll("[data-auth-close]");
    const switchBtns = document.querySelectorAll("[data-auth-target]");

    /* ===============================
       HELPERS
    =============================== */
    const open = (overlay) => {
        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const close = (overlay) => {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* ===============================
       OPEN ACTIONS
    =============================== */
    loginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        close(registerOverlay);
        open(loginOverlay);
    });

    registerBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        close(loginOverlay);
        open(registerOverlay);
    });

    /* ===============================
       CLOSE BUTTONS
    =============================== */
    closeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            close(loginOverlay);
            close(registerOverlay);
        });
    });

    /* ===============================
       SWITCH LOGIN <-> REGISTER
    =============================== */
    switchBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const target = btn.dataset.authTarget;

            if (target === "login") {
                close(registerOverlay);
                open(loginOverlay);
            }

            if (target === "register") {
                close(loginOverlay);
                open(registerOverlay);
            }
        });
    });

    /* ===============================
       OVERLAY CLICK (ONLY BACKGROUND)
    =============================== */
    [loginOverlay, registerOverlay].forEach(overlay => {

        // Prevent inner clicks from closing
        overlay.querySelector(".be-auth-box")
            ?.addEventListener("click", e => e.stopPropagation());

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                close(overlay);
            }
        });
    });

    /* ===============================
       ESC KEY
    =============================== */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (loginOverlay.classList.contains("show")) close(loginOverlay);
            if (registerOverlay.classList.contains("show")) close(registerOverlay);
        }
    });

    console.log("[Auth] header-auth.js initialized safely");
});
