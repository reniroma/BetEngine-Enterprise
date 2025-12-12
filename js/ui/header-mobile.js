/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL STABLE)
 * - Works ONLY after header HTML is injected
 * - No dependency on core.js
 * - No duplicate listeners
 * - Compatible with mobile.css + header-modals.html
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    if (!headerMobile) return;

    /* ===============================
       ELEMENTS
    =============================== */
    const toggleBtn  = headerMobile.querySelector(".mobile-menu-toggle");
    const overlay    = document.querySelector(".mobile-menu-overlay");
    const panel      = document.querySelector(".mobile-menu-panel");
    const closeBtn   = panel?.querySelector(".mobile-menu-close");

    if (!toggleBtn || !overlay || !panel) {
        console.warn("header-mobile.js: required elements missing");
        return;
    }

    /* ===============================
       OPEN / CLOSE
    =============================== */
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

    /* ===============================
       EVENTS
    =============================== */

    // Hamburger
    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openMenu();
    });

    // Close (X)
    closeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    // Overlay click
    overlay.addEventListener("click", () => {
        closeMenu();
    });

    // ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("open")) {
            closeMenu();
        }
    });

    /* ===============================
       NAVIGATION (MENU LINKS)
    =============================== */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", () => {
            const section = link.dataset.section;

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }

            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s => {
                    s === submenu
                        ? s.classList.toggle("open")
                        : s.classList.remove("open");
                });
            } else {
                closeMenu();
            }
        });
    });

    /* ===============================
       QUICK CONTROLS (ODDS / LANG)
    =============================== */
    panel.querySelector(".menu-odds")?.addEventListener("click", () => {
        closeMenu();
        document
            .querySelector(".mobile-odds-toggle")
            ?.click();
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", () => {
        closeMenu();
        document
            .querySelector(".mobile-lang-toggle")
            ?.click();
    });

    console.log("header-mobile.js FINAL initialized");
});
