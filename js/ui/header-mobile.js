/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.0)
 * FIXED: full compatibility with mobile.css
 * - Panel uses .open  (CSS expects .open)
 * - Overlay uses .show
 * - Full scroll lock/unlock
 * - Safe event handling
 *********************************************************/

function initMobileMenu() {

    const mobileHeader = document.querySelector(".header-mobile");
    if (!mobileHeader) return;

    /* Elements */
    const btnToggle     = mobileHeader.querySelector(".mobile-menu-toggle");
    const menuPanel     = document.querySelector(".mobile-menu-panel");
    const menuOverlay   = document.querySelector(".mobile-menu-overlay");
    const btnClose      = document.querySelector(".mobile-menu-close");

    /* Auth triggers inside mobile menu */
    const menuAuthLogin      = document.querySelector(".menu-auth-login");
    const menuAuthRegister   = document.querySelector(".menu-auth-register");
    const desktopLoginBtn    = document.querySelector(".btn-auth.login");
    const desktopRegisterBtn = document.querySelector(".btn-auth.register");

    /* -------------------------
       OPEN MENU
    ------------------------- */
    const openMenu = () => {
        if (!menuPanel || !menuOverlay) return;

        menuPanel.classList.add("open");     // FIXED
        menuOverlay.classList.add("show");   // correct
        document.body.style.overflow = "hidden";
    };

    /* -------------------------
       CLOSE MENU
    ------------------------- */
    const closeMenu = () => {
        if (!menuPanel || !menuOverlay) return;

        menuPanel.classList.remove("open");  // FIXED
        menuOverlay.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* -------------------------
       EVENTS
    ------------------------- */

    // Toggle button (hamburger)
    btnToggle?.addEventListener("click", (e) => {
        e.preventDefault();
        openMenu();
    });

    // Close button (X)
    btnClose?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Click on overlay closes menu
    menuOverlay?.addEventListener("click", () => {
        closeMenu();
    });

    // ESC key closes menu
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    /* -------------------------
       AUTH (Login / Register)
    ------------------------- */
    menuAuthLogin?.addEventListener("click", () => {
        closeMenu();
        desktopLoginBtn?.click();
    });

    menuAuthRegister?.addEventListener("click", () => {
        closeMenu();
        desktopRegisterBtn?.click();
    });

    console.log("Mobile menu initialized (v5.0)");
}

/* Initialize after headers are injected */
document.addEventListener("headerLoaded", initMobileMenu);
