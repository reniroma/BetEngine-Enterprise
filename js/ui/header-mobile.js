/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.0)
 * PATCH MINIMAL
 * Compatible ONLY with new header-modals.html structure
 *
 * RESPONSIBILITIES:
 * 1. Open / close hamburger menu
 * 2. Open mobile Odds / Language / Tools modals
 * 3. Trigger auth (login / register) WITHOUT breaking menu
 * 4. NEVER auto-close hamburger unless explicitly requested
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /* ==================================================
       HELPERS
    ================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const stop = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    /* ==================================================
       ELEMENTS
    ================================================== */
    const overlay   = qs(".mobile-menu-overlay");
    const panel     = qs(".mobile-menu-panel");
    const toggleBtn = qs(".mobile-menu-toggle");
    const closeBtn  = qs(".mobile-menu-close");

    const oddsModal = qs("#mobile-odds-modal");
    const langModal = qs("#mobile-language-modal");
    const toolsModal = qs("#mobile-tools-modal");

    if (!overlay || !panel) return;

    /* ==================================================
       HAMBURGER STATE
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

    /* ==================================================
       MENU TOGGLE
    ================================================== */
    toggleBtn?.addEventListener("click", e => {
        stop(e);
        openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    /* Prevent click-through */
    panel.addEventListener("click", e => e.stopPropagation());

    /* ==================================================
       MOBILE MODALS (ODDS / LANGUAGE / TOOLS)
       IMPORTANT: DO NOT CLOSE HAMBURGER
    ================================================== */
    const openModal = modal => {
        if (!modal) return;
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeModal = modal => {
        if (!modal) return;
        modal.classList.remove("show");
        document.body.style.overflow = "hidden"; // hamburger still open
    };

    qa(".be-modal-close").forEach(btn => {
        btn.addEventListener("click", e => {
            stop(e);
            closeModal(btn.closest(".be-modal-overlay"));
        });
    });

    qa(".be-modal-overlay").forEach(modal => {
        modal.addEventListener("click", e => {
            if (e.target === modal) closeModal(modal);
        });
    });

    /* Triggers */
    qs(".menu-odds")?.addEventListener("click", e => {
        stop(e);
        openModal(oddsModal);
    });

    qs(".menu-lang")?.addEventListener("click", e => {
        stop(e);
        openModal(langModal);
    });

    /* Tools modal can be wired later if needed */
    // qs(".menu-tools")?.addEventListener("click", ...)

    /* ==================================================
       AUTH (LOGIN / REGISTER)
       RULE:
       - Hamburger closes
       - Auth opens via global API
    ================================================== */
    qs(".menu-auth-login")?.addEventListener("click", e => {
        stop(e);
        closeMenu();
        window.BE_openLogin?.();
    });

    qs(".menu-auth-register")?.addEventListener("click", e => {
        stop(e);
        closeMenu();
        window.BE_openRegister?.();
    });

    /* ==================================================
       NAVIGATION (SUBMENUS ONLY)
       RULE:
       - Clicking section toggles submenu
       - NEVER closes hamburger
    ================================================== */
    qa(".menu-link").forEach(link => {
        link.addEventListener("click", e => {
            stop(e);

            const section = link.dataset.section;
            const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);

            if (!submenu) return;

            qa(".submenu", panel).forEach(s =>
                s === submenu
                    ? s.classList.toggle("open")
                    : s.classList.remove("open")
            );
        });
    });

    console.log("header-mobile.js v6.0 READY");
});
