/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.2)
 * FIX:
 * - Bookmakers & Premium activate correctly
 * - Odds / Language open mobile modal
 * - Safe event handling
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    const panel  = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");

    if (!headerMobile || !panel || !overlay) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const closeBtn  = panel.querySelector(".mobile-menu-close");

    /* PREVENT GLOBAL CLICK KILL */
    panel.addEventListener("click", e => e.stopPropagation());

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

    toggleBtn?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    /* NAVIGATION LINKS */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", e => {
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s =>
                    s === submenu
                        ? s.classList.toggle("open")
                        : s.classList.remove("open")
                );
            } else {
                // Bookmakers / Premium
                closeMenu();
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* QUICK CONTROLS → OPEN MOBILE MODAL */
    panel.querySelector(".menu-odds")?.addEventListener("click", e => {
        e.stopPropagation();
        closeMenu();
        document.getElementById("mobile-header-modal")?.classList.add("show");
        document.body.style.overflow = "hidden";
        document.querySelector(".modal-odds")?.classList.add("active");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", e => {
        e.stopPropagation();
        closeMenu();
        document.getElementById("mobile-header-modal")?.classList.add("show");
        document.body.style.overflow = "hidden";
        document.querySelector(".modal-language")?.classList.add("active");
    });

    console.log("header-mobile.js v5.2 READY");
});
