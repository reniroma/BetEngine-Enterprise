/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.1)
 * FIX: Stop event bubbling inside mobile menu panel
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    if (!headerMobile) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const overlay   = document.querySelector(".mobile-menu-overlay");
    const panel     = document.querySelector(".mobile-menu-panel");
    const closeBtn  = panel?.querySelector(".mobile-menu-close");

    if (!toggleBtn || !overlay || !panel) return;

    /* STOP GLOBAL CLICK KILL */
    panel.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    /* OPEN / CLOSE */
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

    toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    closeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("open")) {
            closeMenu();
        }
    });

    /* MENU LINKS */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.stopPropagation();

            const section = link.dataset.section;
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

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* QUICK CONTROLS */
    panel.querySelector(".menu-odds")?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMenu();
        document.querySelector(".mobile-odds-toggle")?.click();
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMenu();
        document.querySelector(".mobile-lang-toggle")?.click();
    });

    console.log("header-mobile.js v5.1 FIXED");
});
