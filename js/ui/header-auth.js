/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (2 MODALS FINAL FIX)
 * Fix: no auto-switch after outside click.
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");

    const loginBtn      = document.querySelector(".btn-auth.login");
    const registerBtn   = document.querySelector(".btn-auth.register");

    const closeBtns     = document.querySelectorAll("[data-auth-close]");
    const switchBtns    = document.querySelectorAll(".auth-switch");

    function open(modal) {
        if (!modal) return;
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function close(modal) {
        if (!modal) return;
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }

    /*******************************
     * OPEN BUTTONS
     *******************************/
    loginBtn?.addEventListener("click", () => {
        close(registerModal);
        open(loginModal);
    });

    registerBtn?.addEventListener("click", () => {
        close(loginModal);
        open(registerModal);
    });

    /*******************************
     * CLOSE BUTTONS (X)
     *******************************/
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            close(loginModal);
            close(registerModal);
        });
    });

    /*******************************
     * SWITCH LOGIN <-> REGISTER
     * Fix: execute ONLY inside active modal
     *******************************/
    switchBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const fromModal =
                loginModal.classList.contains("show")
                    ? loginModal
                    : registerModal;

            const target = btn.dataset.authTarget;

            close(fromModal);

            if (target === "login") open(loginModal);
            else open(registerModal);
        });
    });

    /*******************************
     * CLICK OUTSIDE TO CLOSE
     * Fix: DO NOT trigger switch
     *******************************/
    loginModal?.addEventListener("click", (e) => {
        if (e.target === loginModal) close(loginModal);
    });

    registerModal?.addEventListener("click", (e) => {
        if (e.target === registerModal) close(registerModal);
    });
});
