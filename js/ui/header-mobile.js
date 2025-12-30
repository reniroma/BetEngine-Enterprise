/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.9)
 * MOBILE AUTH SYNC ON HAMBURGER OPEN (OddsPortal-style)
 *********************************************************/

(function () {
    let initialized = false;

    function initHeaderMobile() {
        if (initialized) return;

        /* ==================================================
           HELPERS
        ================================================== */
        const qs = (sel, scope = document) => scope.querySelector(sel);
        const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

        const stop = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const blurActive = () => {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        };

        /* ==================================================
           CORE ELEMENTS
        ================================================== */
        const overlay = qs(".mobile-menu-overlay");
        const panel   = qs(".mobile-menu-panel");
        const toggleBtn = qs(".mobile-menu-toggle");
        const closeBtn  = qs(".mobile-menu-close");

        const oddsModal = qs("#mobile-odds-modal");
        const langModal = qs("#mobile-language-modal");
        const bookmarksModal = qs("#mobile-bookmarks-modal");

        if (!overlay || !panel || !toggleBtn) return;
        initialized = true;

        /* ==================================================
           AUTH SYNC (MOBILE ONLY)
           OddsPortal-style: sync ON OPEN
        ================================================== */
        const syncMobileAuth = () => {
            if (!window.BEAuth?.getState) return;

            const state = window.BEAuth.getState();

            const guestBox = qs(".mobile-auth-guest", panel);
            const userBox  = qs(".mobile-auth-user", panel);
            const userName = qs(".mobile-auth-user .username", panel);

            if (!guestBox || !userBox) return;

            if (state.authenticated) {
                guestBox.hidden = true;
                userBox.hidden = false;

                if (userName && state.user) {
                    userName.textContent = state.user.username || "";
                }
            } else {
                guestBox.hidden = false;
                userBox.hidden = true;
            }
        };

        /* ==================================================
           HAMBURGER STATE
        ================================================== */
        const forceOddsOpen = () => {
            const oddsSub = qs('.submenu[data-subnav="odds"]', panel);
            if (oddsSub) oddsSub.classList.add("open");
        };

        const openMenu = () => {
            blurActive();

            overlay.classList.add("show");
            panel.classList.add("open");

            /* 🔑 CRITICAL FIX */
            syncMobileAuth();

            forceOddsOpen();

            document.body.style.overflow = "hidden";
            document.body.classList.add("menu-open");
        };

        const closeMenu = () => {
            blurActive();

            overlay.classList.remove("show");
            panel.classList.remove("open");
            panel.classList.remove("premium-mode");

            qa(".submenu", panel).forEach((s) => {
                if (s.dataset.subnav !== "odds") s.classList.remove("open");
            });

            forceOddsOpen();

            document.body.style.overflow = "";
            document.body.classList.remove("menu-open");
        };

        /* ==================================================
           HAMBURGER EVENTS
        ================================================== */
        toggleBtn.addEventListener("click", (e) => {
            stop(e);
            openMenu();
        });

        closeBtn?.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);
        panel.addEventListener("click", (e) => e.stopPropagation());

        /* ==================================================
           AUTH BUTTONS (OPEN MODALS)
        ================================================== */
        qs(".menu-auth-login")?.addEventListener("click", (e) => {
            stop(e);
            closeMenu();
            window.BE_openLogin?.();
        });

        qs(".menu-auth-register")?.addEventListener("click", (e) => {
            stop(e);
            closeMenu();
            window.BE_openRegister?.();
        });

        console.log("header-mobile.js v6.9 READY – AUTH SYNC ON OPEN");
    }

    document.addEventListener("headerLoaded", initHeaderMobile);
    document.addEventListener("DOMContentLoaded", initHeaderMobile);
})();
