/*********************************************************
 * BetEngine Enterprise – AUTH MODAL SYSTEM (FINAL v3)
 * Handles: open, close, switch tabs, preserve state.
 * Works with single #auth-modal containing login/register panes.
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /*******************************************************
     * ELEMENTS
     *******************************************************/
    const authOverlay = document.getElementById("auth-modal");
    const authBox     = authOverlay?.querySelector(".be-auth-box");

    const loginBtn    = document.querySelector(".btn-auth.login");
    const registerBtn = document.querySelector(".btn-auth.register");

    const closeBtn    = authOverlay?.querySelector(".auth-close");

    const tabs  = authOverlay?.querySelectorAll(".auth-tab");
    const panes = authOverlay?.querySelectorAll(".auth-pane");

    const switchLinks = authOverlay?.querySelectorAll("[data-auth-switch]");

    if (!authOverlay || !authBox) {
        console.warn("Auth modal elements missing.");
        return;
    }

    /*******************************************************
     * HELPERS
     *******************************************************/
    function openAuth(mode) {
        // Reset active states
        tabs.forEach(t => t.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));

        // Activate correct tab + pane
        const tab  = authOverlay.querySelector(`[data-auth-tab="${mode}"]`);
        const pane = authOverlay.querySelector(`[data-auth-pane="${mode}"]`);

        if (tab)  tab.classList.add("active");
        if (pane) pane.classList.add("active");

        // Show modal
        authOverlay.classList.add("show");
        authBox.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeAuth() {
        authOverlay.classList.remove("show");
        authBox.classList.remove("show");
        document.body.style.overflow = "";
    }

    /*******************************************************
     * OPEN FROM HEADER BUTTONS
     *******************************************************/
    loginBtn?.addEventListener("click", () => openAuth("login"));
    registerBtn?.addEventListener("click", () => openAuth("register"));

    /*******************************************************
     * CLOSE BUTTON (X)
     *******************************************************/
    closeBtn?.addEventListener("click", () => closeAuth());

    /*******************************************************
     * SWITCH BETWEEN LOGIN <-> REGISTER
     *******************************************************/
    switchLinks?.forEach(link => {
        link.addEventListener("click", () => {
            const target = link.dataset.authSwitch; // "login" or "register"
            openAuth(target);
        });
    });

    /*******************************************************
     * CLOSE WHEN CLICKING OUTSIDE MODAL BOX
     *******************************************************/
    authOverlay.addEventListener("click", (e) => {
        if (e.target === authOverlay) {
            closeAuth(); // no tab reset here
        }
    });
});
