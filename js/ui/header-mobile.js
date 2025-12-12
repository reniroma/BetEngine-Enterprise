/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.0)
 * Phase 3 – STRICT UX RULES APPLIED
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const header  = document.querySelector(".header-mobile");
    const panel   = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const modal   = document.getElementById("mobile-header-modal");

    if (!header || !panel || !overlay) return;

    const btnOpen  = header.querySelector(".mobile-menu-toggle");
    const btnClose = panel.querySelector(".mobile-menu-close");

    /* ====================================================
       HARD ISOLATION – NOTHING INSIDE CLOSES MENU
    ==================================================== */
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

    /* ====================================================
       OPEN / CLOSE CONTROLS
    ==================================================== */
    btnOpen?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    btnClose?.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") closeMenu();
    });

    /* ====================================================
       NAVIGATION (NO AUTO-CLOSE)
    ==================================================== */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s =>
                    s === submenu
                        ? s.classList.toggle("open")
                        : s.classList.remove("open")
                );
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ====================================================
       ODDS / LANGUAGE → OPEN MODAL (KEEP MENU OPEN)
    ==================================================== */
    panel.querySelector(".menu-odds")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openModal("odds");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openModal("language");
    });

    function openModal(type) {
        if (!modal) return;

        modal.classList.add("show");

        modal.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal.querySelector(`.modal-${type}`)?.classList.add("active");
    }

    /* ====================================================
       LOGIN / REGISTER (CLOSE MENU AFTER OPEN)
    ==================================================== */
    panel.querySelector(".menu-auth-login")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        document.querySelector(".btn-auth.login")?.click();
    });

    panel.querySelector(".menu-auth-register")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        document.querySelector(".btn-auth.register")?.click();
    });

    console.log("[header-mobile] Phase 3 READY");
});
