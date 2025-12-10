/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (2 MODALS)
 * Login + Register (separate overlays)
 * FINAL VERSION – WITH FIX FOR REGISTER OVERLAY BUG
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /*******************************************************
     * ELEMENT REFERENCES
     *******************************************************/
    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");

    const loginBox      = loginModal?.querySelector(".be-auth-box");
    const registerBox   = registerModal?.querySelector(".be-auth-box");

    const loginBtn      = document.querySelector(".btn-auth.login");
    const registerBtn   = document.querySelector(".btn-auth.register");

    const closeBtns     = document.querySelectorAll("[data-auth-close]");
    const switchBtns    = document.querySelectorAll(".auth-switch");

    /*******************************************************
     * HELPERS: OPEN / CLOSE
     *******************************************************/
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

    /*******************************************************
     * OPEN BUTTONS
     *******************************************************/
    loginBtn?.addEventListener("click", () => {
        close(registerModal);
        open(loginModal);
    });

    registerBtn?.addEventListener("click", () => {
        close(loginModal);
        open(registerModal);
    });

    /*******************************************************
     * CLOSE BUTTONS (X)
     *******************************************************/
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            close(loginModal);
            close(registerModal);
        });
    });

    /*******************************************************
     * SWITCH LOGIN <-> REGISTER
     *******************************************************/
    switchBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.authTarget;

            if (target === "login") {
                close(registerModal);
                open(loginModal);
            }
            else if (target === "register") {
                close(loginModal);
                open(registerModal);
            }
        });
    });

    /*******************************************************
     * FIX KRITIK:
     * Prevent clicks inside modal box from closing overlay
     *******************************************************/
    loginBox?.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    registerBox?.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    /*******************************************************
     * CLOSE ONLY WHEN CLICKING STRICTLY ON THE OVERLAY
     *******************************************************/
    [loginModal, registerModal].forEach(modal => {
        modal?.addEventListener("click", (e) => {

            // click MUST be exactly on the overlay background
            const isOverlay = e.target === modal;

            if (isOverlay) {
                close(modal);
            }
        });
    });
});
