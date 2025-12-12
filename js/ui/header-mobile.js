/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.4)
 * Rules implemented:
 * - Clicking Odds/Community/Bookmakers/Premium NEVER closes hamburger
 * - They only toggle their submenu inside hamburger
 * - Odds/Language open the mobile modal WITHOUT closing hamburger
 * - Login/Register trigger auth modals (do not get killed by global click capture)
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    const panel = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const modal = document.getElementById("mobile-header-modal");

    if (!headerMobile || !panel || !overlay) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const closeBtn = panel.querySelector(".mobile-menu-close");

    /* ====================================================
       HARD STOP: prevent any document-level CAPTURE closers
    ==================================================== */
    const stopAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
            e.stopImmediatePropagation();
        }
    };

    panel.addEventListener("click", (e) => e.stopPropagation(), true);
    panel.addEventListener("click", (e) => e.stopPropagation(), false);

    /* Keep modal clicks from closing panel */
    if (modal) {
        modal.addEventListener("click", (e) => e.stopPropagation(), true);
        modal.addEventListener("click", (e) => e.stopPropagation(), false);
    }

    const openMenu = () => {
        overlay.classList.add("show");
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        overlay.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
        overlay.classList.remove("show");
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    toggleBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    closeBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });

    overlay.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });

    /* ====================================================
       SECTION LINKS: toggle submenus only (never close)
    ==================================================== */
    panel.querySelectorAll(".menu-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            if (!section) return;

            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach((s) => {
                    if (s === submenu) s.classList.toggle("open");
                    else s.classList.remove("open");
                });
            }

            if (typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ====================================================
       QUICK CONTROLS: open modal WITHOUT closing hamburger
    ==================================================== */
    const openMobileModal = (type, titleText) => {
        if (!modal) return;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        const title = modal.querySelector(".be-modal-title");
        if (title && titleText) title.textContent = titleText;

        modal.querySelectorAll(".be-modal-section").forEach((s) => s.classList.remove("active"));
        modal.querySelector(`.modal-${type}`)?.classList.add("active");
    };

    panel.querySelector(".menu-odds")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMobileModal("odds", "Odds format");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMobileModal("language", "Language");
    });

    /* ====================================================
       AUTH: trigger desktop auth buttons (header-auth.js listens there)
       IMPORTANT: do NOT allow click to bubble to any global closers
    ==================================================== */
    panel.querySelector(".menu-auth-login")?.addEventListener("click", (e) => {
        stopAll(e);
        document.querySelector(".btn-auth.login")?.click();
    });

    panel.querySelector(".menu-auth-register")?.addEventListener("click", (e) => {
        stopAll(e);
        document.querySelector(".btn-auth.register")?.click();
    });

    console.log("header-mobile.js v5.4 READY");
});
