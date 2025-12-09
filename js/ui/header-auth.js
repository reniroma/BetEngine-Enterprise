/*********************************************************
 * BetEngine Enterprise – AUTH LOGIC (FINAL v1.0)
 * Login + Register tabs + modal control
 *********************************************************/

document.addEventListener("headerLoaded", () => {
    const overlay = document.querySelector(".be-auth-overlay");
    if (!overlay) return;

    const title = overlay.querySelector("#auth-title");
    const tabs = overlay.querySelectorAll(".auth-tab");
    const panes = overlay.querySelectorAll(".auth-pane");
    const closeBtn = overlay.querySelector(".auth-close");

    const loginBtn = document.querySelector(".btn-auth.login");
    const registerBtn = document.querySelector(".btn-auth.register");

    const switchLinks = overlay.querySelectorAll("[data-auth-switch]");

    const openModal = (mode) => {
        if (title) title.textContent = mode === "login" ? "Login" : "Create account";

        tabs.forEach(tab =>
            tab.classList.toggle("active", tab.dataset.authTab === mode)
        );

        panes.forEach(pane =>
            pane.classList.toggle("active", pane.dataset.authPane === mode)
        );

        overlay.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* OPEN EVENTS */
    loginBtn?.addEventListener("click", () => openModal("login"));
    registerBtn?.addEventListener("click", () => openModal("register"));

    /* SWITCH BETWEEN TABS FROM FOOTER LINKS */
    switchLinks.forEach(link => {
        link.addEventListener("click", () => {
            const target = link.dataset.authSwitch;
            openModal(target);
        });
    });

    /* TABS CLICK */
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            openModal(tab.dataset.authTab);
        });
    });

    /* CLOSE EVENTS */
    closeBtn?.addEventListener("click", closeModal);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.classList.contains("show")) {
            closeModal();
        }
    });
});
