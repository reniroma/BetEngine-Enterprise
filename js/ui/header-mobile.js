/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.3)
 * FIXED:
 * - Odds / Language open modal WITHOUT closing hamburger
 * - Login / Register now functional on mobile
 * - Bookmakers & Premium close menu correctly
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    const panel   = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const modal   = document.getElementById("mobile-header-modal");

    if (!headerMobile || !panel || !overlay) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const closeBtn  = panel.querySelector(".mobile-menu-close");

    /* Prevent click-through */
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

    /* ===============================
       NAVIGATION LINKS
    =============================== */
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
            } else {
                closeMenu();
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ===============================
       QUICK CONTROLS (ODDS / LANGUAGE)
       DO NOT CLOSE HAMBURGER
    =============================== */
    panel.querySelector(".menu-odds")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        modal?.classList.add("show");
        document.body.style.overflow = "hidden";

        modal?.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal?.querySelector(".modal-odds")?.classList.add("active");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        modal?.classList.add("show");
        document.body.style.overflow = "hidden";

        modal?.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal?.querySelector(".modal-language")?.classList.add("active");
    });

    /* ===============================
       AUTH (LOGIN / REGISTER) – MOBILE
    =============================== */
    panel.querySelector(".menu-auth-login")?.addEventListener("click", e => {
        e.preventDefault();
        closeMenu();
        document.querySelector(".btn-auth.login")?.click();
    });

    panel.querySelector(".menu-auth-register")?.addEventListener("click", e => {
        e.preventDefault();
        closeMenu();
        document.querySelector(".btn-auth.register")?.click();
    });

    console.log("header-mobile.js v5.3 READY");
});
