/*********************************************************
 * BetEngine Enterprise – HEADER AUTH JS (FINAL v3.0)
 * Scope: Login & Register ONLY
 * No mobile menu control
 * No global click handlers
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const loginModal    = document.getElementById("auth-login");
    const registerModal = document.getElementById("auth-register");

    const loginBtn    = document.querySelector(".btn-auth.login");
    const registerBtn = document.querySelector(".btn-auth.register");

    if (!loginModal || !registerModal) {
        console.warn("[Auth] Modals not found");
        return;
    }

    /* ====================================================
       HELPERS
    ==================================================== */
    const openModal = (modal) => {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeModal = (modal) => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
    };

    const closeAll = () => {
        closeModal(loginModal);
        closeModal(registerModal);
    };

    /* ====================================================
       OPEN BUTTONS
    ==================================================== */
    loginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal(registerModal);
        openModal(loginModal);
    });

    registerBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal(loginModal);
        openModal(registerModal);
    });

    /* ====================================================
       CLOSE BUTTONS INSIDE MODALS
    ==================================================== */
    document.querySelectorAll("[data-auth-close]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            closeAll();
        });
    });

    /* ====================================================
       CLICK ON OVERLAY CLOSES MODAL
    ==================================================== */
    [loginModal, registerModal].forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    /* ====================================================
       ESC KEY
    ==================================================== */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAll();
    });

    console.log("[Auth] Login/Register ready");

});
