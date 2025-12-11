/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v4.0)
 * System B — Uses `.show` for mobile menu + overlay
 * 100% compatible with current mobile.css
 *********************************************************/

/* ======================================================
   INIT MOBILE MENU
======================================================= */
function initMobileMenu() {

    const mobileHeader = document.querySelector(".header-mobile");
    if (!mobileHeader) return;

    /* Elements */
    const btnToggle   = mobileHeader.querySelector(".mobile-menu-toggle");
    const menuPanel   = document.querySelector(".mobile-menu-panel");
    const menuOverlay = document.querySelector(".mobile-menu-overlay");
    const btnClose    = document.querySelector(".mobile-menu-close");

    /* Auth in panel (optional) */
    const menuAuthLogin    = document.querySelector(".menu-auth-login");
    const menuAuthRegister = document.querySelector(".menu-auth-register");
    const desktopLoginBtn    = document.querySelector(".btn-auth.login");
    const desktopRegisterBtn = document.querySelector(".btn-auth.register");

    /* -------------------------
       OPEN / CLOSE MENU
    ------------------------- */
    const openMenu = () => {
        if (!menuPanel || !menuOverlay) return;

        menuPanel.classList.add("show");
        menuOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
        if (!menuPanel || !menuOverlay) return;

        menuPanel.classList.remove("show");
        menuOverlay.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* -------------------------
       EVENTS
    ------------------------- */

    // Open
    btnToggle?.addEventListener("click", (e) => {
        e.preventDefault();
        openMenu();
    });

    // Close by X button
    btnClose?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Close by overlay click
    menuOverlay?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Close by ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    /* -------------------------
       LOGIN / REGISTER
    ------------------------- */
    menuAuthLogin?.addEventListener("click", () => {
        closeMenu();
        desktopLoginBtn?.click();
    });

    menuAuthRegister?.addEventListener("click", () => {
        closeMenu();
        desktopRegisterBtn?.click();
    });

    console.log("Mobile menu (SHOW system) initialized");
}

/* Wait until header HTML is injected */
document.addEventListener("headerLoaded", initMobileMenu);
