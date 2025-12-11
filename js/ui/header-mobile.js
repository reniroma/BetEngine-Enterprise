/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (v3.0)
 * Scope: ONLY mobile header + hamburger menu behaviour.
 *
 * - Open / close hamburger (overlay + panel)
 * - Handle menu links + submenus (Odds / Community / Bookmakers / Premium)
 * - Sync section with existing mobile chips (nav-chip) + desktop logic
 * - Trigger existing desktop LOGIN / REGISTER modals from hamburger
 *
 * This file does NOT touch desktop header behaviour and
 * does NOT depend on header.js internals.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * SAFE LOOKUP HELPERS (MOBILE ONLY)
     *******************************************************/
    const mobileHeader = document.querySelector(".header-mobile");
    if (!mobileHeader) return;

    const menuToggle  = mobileHeader.querySelector(".mobile-menu-toggle");
    const overlay     = mobileHeader.querySelector(".mobile-menu-overlay");
    const panel       = mobileHeader.querySelector(".mobile-menu-panel");
    const closeButton = mobileHeader.querySelector(".mobile-menu-close");

    const menuLinks = mobileHeader.querySelectorAll(".mobile-menu-panel .menu-link");
    const subMenus  = mobileHeader.querySelectorAll(".mobile-menu-panel .submenu");

    // Optional (if i shton më vonë):
    const menuLogin    = mobileHeader.querySelector(".mobile-menu-panel .menu-auth-login");
    const menuRegister = mobileHeader.querySelector(".mobile-menu-panel .menu-auth-register");

    /*******************************************************
     * HAMBURGER OPEN / CLOSE
     *******************************************************/
    const openMenu = () => {
        if (!panel || !overlay) return;

        panel.classList.add("open");
        overlay.classList.add("open");
        document.body.classList.add("mobile-menu-open");
    };

    const closeMenu = () => {
        if (!panel || !overlay) return;

        panel.classList.remove("open");
        overlay.classList.remove("open");
        document.body.classList.remove("mobile-menu-open");
    };

    // Open nga butoni hamburger
    menuToggle?.addEventListener("click", (e) => {
        e.preventDefault();
        openMenu();
    });

    // Mbyllje nga overlay
    overlay?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Mbyllje nga butoni X
    closeButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // ESC mbyll menunë nëse është hapur
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel?.classList.contains("open")) {
            closeMenu();
        }
    });

    /*******************************************************
     * NAVIGATION INSIDE HAMBURGER (MENU-LINK + SUBMENU)
     *
     * - Klikon "Odds Comparison" / "Community" / "Bookmakers" / "Premium"
     *   → hapet / mbyllet submenu përkatës
     *   → sinjalizon sistemin ekzistues për seksionin (me nav-chip)
     *******************************************************/
    const toggleSubmenu = (section) => {
        if (!section) return;

        subMenus.forEach(sub => {
            const target = sub.dataset.subnav;
            if (!target) return;

            if (target === section) {
                // Toggle vetëm submenu e seksionit aktiv
                sub.classList.toggle("open");
            } else {
                sub.classList.remove("open");
            }
        });
    };

    const syncSectionViaChip = (section) => {
        if (!section) return;

        // Përdor nav-chip ekzistuese që lidhen me header.js (initSectionNavigation)
        const chip = document.querySelector(`.mobile-main-nav .nav-chip[data-section="${section}"]`);
        if (chip) {
            chip.click(); // le header.js të bëjë pjesën tjetër (desktop + row-sub sync)
        }
    };

    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (!section) return;

            // Active state për link-ët në panel
            menuLinks.forEach(l => l.classList.toggle("active", l === link));

            // Hap / mbyll submenu brenda panelit
            toggleSubmenu(section);

            // Sinjalizo nav-in ekzistues për seksionin
            syncSectionViaChip(section);
        });
    });

    /*******************************************************
     * LOGIN / REGISTER NGA HAMBURGER
     *
     * Këta butona parashikohen në HTML si:
     * <button class="menu-auth-login">Login</button>
     * <button class="menu-auth-register">Register</button>
     *
     * Nuk krijojmë modale të reja – thjesht
     * klikojmë butonat ekzistues .btn-auth.login/register.
     *******************************************************/
    const desktopLoginBtn    = document.querySelector(".btn-auth.login");
    const desktopRegisterBtn = document.querySelector(".btn-auth.register");

    menuLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        desktopLoginBtn?.click();  // hap modal-in ekzistues të login
        closeMenu();
    });

    menuRegister?.addEventListener("click", (e) => {
        e.preventDefault();
        desktopRegisterBtn?.click(); // hap modal-in ekzistues të register
        closeMenu();
    });

});
