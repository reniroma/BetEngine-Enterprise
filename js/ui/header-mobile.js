/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.0)
 * Enterprise rules:
 * - Hamburger NEVER closes on internal clicks
 * - Odds / Language open mobile modal
 * - Navigation opens submenus
 * - Login / Register open auth modals
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const header   = document.querySelector(".header-mobile");
    const panel    = document.querySelector(".mobile-menu-panel");
    const overlay  = document.querySelector(".mobile-menu-overlay");
    const modal    = document.getElementById("mobile-header-modal");

    if (!header || !panel || !overlay) return;

    const toggleBtn = header.querySelector(".mobile-menu-toggle");
    const closeBtn  = panel.querySelector(".mobile-menu-close");

    /* ==================================================
       CORE OPEN / CLOSE (ONLY THESE CAN CLOSE MENU)
    ================================================== */
    const openMenu = () => {
        overlay.classList.add("show");
        panel.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
        overlay.classList.remove("show");
        panel.classList.remove("open");
        document.body.style.overflow = "";
    };

    toggleBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);

    /* ==================================================
       PREVENT CLICK-THROUGH
    ================================================== */
    panel.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    /* ==================================================
       NAVIGATION (SUBMENUS)
    ================================================== */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s => {
                    s === submenu
                        ? s.classList.toggle("open")
                        : s.classList.remove("open");
                });
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ==================================================
       QUICK CONTROLS (ODDS / LANGUAGE)
    ================================================== */
    panel.querySelector(".menu-odds")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!modal) return;

        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        modal.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal.querySelector(".modal-odds")?.classList.add("active");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!modal) return;

        modal.classList.add("show");
        document.body.style.overflow = "hidden";

        modal.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal.querySelector(".modal-language")?.classList.add("active");
    });

    /* ==================================================
       AUTH (LOGIN / REGISTER)
    ================================================== */
    panel.querySelector(".menu-auth-login")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector(".btn-auth.login")?.click();
    });

    panel.querySelector(".menu-auth-register")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector(".btn-auth.register")?.click();
    });

    console.log("[BetEngine] header-mobile.js v6.0 initialized");
});
