/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (2 MODALS)
 * FINAL VERSION – stable & fixed
 * Handles:
 *  - open login modal
 *  - open register modal
 *  - switch between them
 *  - close on X
 *  - close on outside click
 *  WITHOUT modifying modal layout or causing style reset
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /*******************************************************
     * ELEMENTS
     *******************************************************/
    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");

    const loginBtn      = document.querySelector(".btn-auth.login");
    const registerBtn   = document.querySelector(".btn-auth.register");

    const closeBtns     = document.querySelectorAll("[data-auth-close]");
    const switchBtns    = document.querySelectorAll(".auth-switch");

    /*******************************************************
     * HELPERS
     *******************************************************/
    function open(modal) {
        if (!modal) return;

        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function close(modal) {
        if (!modal) return;

        modal.classList.remove("show");

        // Only restore scrolling if *both* modals are closed
        if (!loginModal.classList.contains("show") &&
            !registerModal.classList.contains("show")) {
            document.body.style.overflow = "";
        }
    }

    /*******************************************************
     * OPEN LOGIN
     *******************************************************/
    loginBtn?.addEventListener("click", () => {
        close(registerModal); 
        open(loginModal);
    });

    /*******************************************************
     * OPEN REGISTER
     *******************************************************/
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
            const target = btn.dataset.authTarget; // login | register

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
     * CLOSE ONLY WHEN CLICKING OUTSIDE BOX
     * Does NOT modify layout at all.
     *******************************************************/
    [loginModal, registerModal].forEach(modal => {
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) {
                close(modal);
            }
        });
    });

});
