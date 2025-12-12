/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL)
 * Rules:
 * - Hamburger NEVER auto-closes on top-level navigation clicks
 * - Odds/Language open the mobile modal without closing menu
 * - Login/Register triggers auth overlays (desktop buttons)
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    const panel   = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const modal   = document.getElementById("mobile-header-modal");

    if (!headerMobile || !panel || !overlay) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const closeBtn  = panel.querySelector(".mobile-menu-close");

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

    closeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    overlay.addEventListener("click", closeMenu);

    // Prevent click-through closing due to global listeners
    panel.addEventListener("click", (e) => e.stopPropagation());

    // ESC closes hamburger (only)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("open")) {
            closeMenu();
        }
    });

    /* ---------------------------------------
       Top-level navigation: toggle submenus
       (Never close hamburger automatically)
    ---------------------------------------- */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s => {
                    if (s === submenu) s.classList.toggle("open");
                    else s.classList.remove("open");
                });
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ---------------------------------------
       Quick Controls: open modal without closing menu
    ---------------------------------------- */
    const openModalSection = (sectionClass) => {
        if (!modal) return;

        modal.classList.add("show");

        modal.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal.querySelector(sectionClass)?.classList.add("active");

        // Keep scroll locked (menu is already locking it)
        document.body.style.overflow = "hidden";
    };

    panel.querySelector(".menu-odds")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModalSection(".modal-odds");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModalSection(".modal-language");
    });

    /* ---------------------------------------
       Mobile auth triggers
    ---------------------------------------- */
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

    console.log("[header-mobile] Initialized (stable rules)");
});
