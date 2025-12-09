/*********************************************************
 * BetEngine Enterprise – AUTH SYSTEM (LOGIN + REGISTER)
 * Independent from dropdowns / header / mobile modal.
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");
    const loginBtn      = document.querySelector(".btn-auth.login");
    const registerBtn   = document.querySelector(".btn-auth.register");

    const closeBtns = document.querySelectorAll("[data-auth-close]");
    const switchBtns = document.querySelectorAll(".auth-switch");

    const open = (modal) => {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const close = (modal) => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* Open login modal */
    loginBtn?.addEventListener("click", () => {
        close(registerModal);
        open(loginModal);
    });

    /* Open register modal */
    registerBtn?.addEventListener("click", () => {
        close(loginModal);
        open(registerModal);
    });

    /* Close buttons */
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            close(loginModal);
            close(registerModal);
        });
    });

    /* Switch between login <-> register */
    switchBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.authTarget;
            if (target === "login") {
                close(registerModal);
                open(loginModal);
            } else {
                close(loginModal);
                open(registerModal);
            }
        });
    });

    /* Close on outside click */
    [loginModal, registerModal].forEach(modal => {
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) close(modal);
        });
    });
});
