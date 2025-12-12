/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (PATCHED)
 * - Unified auth trigger for desktop + mobile
 * - Listens to "openAuth" custom event
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");

    if (!loginModal || !registerModal) return;

    const open = (modal) => {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const close = (modal) => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* Desktop buttons */
    document.querySelector(".btn-auth.login")?.addEventListener("click", () => {
        close(registerModal);
        open(loginModal);
    });

    document.querySelector(".btn-auth.register")?.addEventListener("click", () => {
        close(loginModal);
        open(registerModal);
    });

    /* Mobile / global event */
    document.addEventListener("openAuth", (e) => {
        if (e.detail === "login") {
            close(registerModal);
            open(loginModal);
        }
        if (e.detail === "register") {
            close(loginModal);
            open(registerModal);
        }
    });

    /* Close buttons */
    document.querySelectorAll("[data-auth-close]").forEach(btn => {
        btn.addEventListener("click", () => {
            close(loginModal);
            close(registerModal);
        });
    });

    /* Overlay click */
    [loginModal, registerModal].forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) close(modal);
        });
    });

    /* ESC */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            close(loginModal);
            close(registerModal);
        }
    });

    console.log("header-auth.js PATCH READY");
});
