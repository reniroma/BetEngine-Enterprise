/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL – PHASE 3)
 * RULES APPLIED:
 * - Hamburger controls ONLY hamburger
 * - Odds / Language open mobile modal WITHOUT closing hamburger
 * - Login / Register close hamburger and open auth via public API
 * - Navigation toggles submenus, hamburger stays open
 * - NO global click killers
 * - NO desktop interference
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ==================================================
       SAFE HELPERS
    ================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    /* ==================================================
       CORE ELEMENTS
    ================================================== */
    const headerMobile = qs(".header-mobile");
    const panel   = qs(".mobile-menu-panel");
    const overlay = qs(".mobile-menu-overlay");
    const modal   = qs("#mobile-header-modal");

    if (!headerMobile || !panel || !overlay) {
        console.warn("[header-mobile] Required elements missing");
        return;
    }

    const toggleBtn = qs(".mobile-menu-toggle", headerMobile);
    const closeBtn  = qs(".mobile-menu-close", panel);

    /* ==================================================
       HAMBURGER OPEN / CLOSE (ONLY THIS)
    ================================================== */
    const openMenu = () => {
        panel.classList.add("open");
        overlay.classList.add("show");
    };

    const closeMenu = () => {
        panel.classList.remove("open");
        overlay.classList.remove("show");
    };

    on(toggleBtn, "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    on(closeBtn, "click", (e) => {
        e.preventDefault();
        closeMenu();
    });

    on(overlay, "click", closeMenu);

    /* Prevent click-through closing */
    on(panel, "click", (e) => e.stopPropagation());

    /* ==================================================
       NAVIGATION (SUBMENUS – DO NOT CLOSE HAMBURGER)
    ================================================== */
    qa(".menu-link", panel).forEach(link => {
        on(link, "click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);

            if (submenu) {
                qa(".submenu", panel).forEach(s =>
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

    /* ==================================================
       MOBILE MODAL (ODDS / LANGUAGE)
       - Hamburger MUST stay open
    ================================================== */
    const openMobileModal = (type) => {
        if (!modal) return;

        qa(".be-modal-section", modal).forEach(s =>
            s.classList.remove("active")
        );

        qs(`.modal-${type}`, modal)?.classList.add("active");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    on(qs(".menu-odds", panel), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMobileModal("odds");
    });

    on(qs(".menu-lang", panel), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMobileModal("language");
    });

    /* ==================================================
       AUTH (LOGIN / REGISTER)
       - Close hamburger
       - Open auth via PUBLIC API ONLY
    ================================================== */
    on(qs(".menu-auth-login", panel), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        modal?.classList.remove("show");
        document.body.style.overflow = "hidden";

        if (typeof window.BE_openLogin === "function") {
            window.BE_openLogin();
        }
    });

    on(qs(".menu-auth-register", panel), "click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        modal?.classList.remove("show");
        document.body.style.overflow = "hidden";

        if (typeof window.BE_openRegister === "function") {
            window.BE_openRegister();
        }
    });

    console.log("header-mobile.js – PHASE 3 READY");
});
