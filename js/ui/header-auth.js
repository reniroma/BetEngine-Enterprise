/*********************************************************
 * BetEngine Enterprise – HEADER AUTH MODULE (v2.0)
 * Handles login + register modals (separate files)
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const loginBtn    = document.querySelector(".btn-auth.login");
    const registerBtn = document.querySelector(".btn-auth.register");

    const loginModal    = document.getElementById("login-modal");
    const registerModal = document.getElementById("register-modal");

    if (!loginModal || !registerModal) return;

    /* Open / Close helpers */
    const open = (modal) => {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const close = (modal) => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* LOGIN BUTTON */
    loginBtn?.addEventListener("click", () => open(loginModal));

    /* REGISTER BUTTON */
    registerBtn?.addEventListener("click", () => open(registerModal));

    /* Close buttons */
    loginModal.querySelector(".auth-close")?.addEventListener("click", () => close(loginModal));
    registerModal.querySelector(".auth-close")?.addEventListener("click", () => close(registerModal));

    /* Click outside */
    loginModal.addEventListener("click", (e) => {
        if (e.target === loginModal) close(loginModal);
    });

    registerModal.addEventListener("click", (e) => {
        if (e.target === registerModal) close(registerModal);
    });

    /* ESC key */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            close(loginModal);
            close(registerModal);
        }
    });

    /* SWITCHES BETWEEN LOGIN & REGISTER */
    document.querySelectorAll("[data-open-register]").forEach(btn => {
        btn.addEventListener("click", () => {
            close(loginModal);
            open(registerModal);
        });
    });

    document.querySelectorAll("[data-open-login]").forEach(btn => {
        btn.addEventListener("click", () => {
            close(registerModal);
            open(loginModal);
        });
    });

});
