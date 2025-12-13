/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.3)
 * SAFE / MINIMAL / STABLE
 *
 * Auth rule (TEMP UX):
 * User is logged-in ONLY if <body> has class "is-authenticated"
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
       CORE ELEMENTS
    ================================================== */
    const overlay   = qs(".mobile-menu-overlay");
    const panel     = qs(".mobile-menu-panel");
    const toggleBtn = qs(".mobile-menu-toggle");
    const closeBtn  = qs(".mobile-menu-close");

    const oddsModal      = qs("#mobile-odds-modal");
    const langModal      = qs("#mobile-language-modal");
    const bookmarksModal = qs("#mobile-bookmarks-modal");

    if (!overlay || !panel || !toggleBtn) return;

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
       HAMBURGER EVENTS
    ================================================== */
    toggleBtn.addEventListener("click", e => {
        stop(e);
        openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);
    panel.addEventListener("click", e => e.stopPropagation());

    /* ==================================================
       GENERIC MODAL HANDLERS
    ================================================== */
    const openModal = modal => {
        if (!modal) return;
        modal.classList.add("show");
    };

    const closeModal = modal => {
        if (!modal) return;
        modal.classList.remove("show");
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

    /* ==================================================
       ODDS / LANGUAGE MODALS
       Hamburger stays open
    ================================================== */
    qs(".menu-odds")?.addEventListener("click", e => {
        stop(e);
        openModal(oddsModal);
    });

    qs(".menu-lang")?.addEventListener("click", e => {
        stop(e);
        openModal(langModal);
    });

    /* ==================================================
       BOOKMARKS (MANAGE MY LEAGUES)
       LOGIN GUARD (UX ONLY)
       ✅ PATCH: pointerdown + closest (event delegation)
    ================================================== */
    document.addEventListener("pointerdown", e => {
        const btn = e.target.closest(".mobile-bookmarks-btn");
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const isLoggedIn =
            document.body.classList.contains("is-authenticated");

        if (!isLoggedIn) {
            closeMenu();
            window.BE_openLogin?.();
            return;
        }

        openModal(bookmarksModal);
    });

    /* ==================================================
       AUTH (LOGIN / REGISTER)
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
       NAVIGATION (SUBMENUS)
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

    console.log("header-mobile.js v6.3 READY");
});
