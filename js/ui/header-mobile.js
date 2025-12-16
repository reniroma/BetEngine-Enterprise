/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.4)
 * SAFE / MINIMAL / STABLE
 *
 * Responsibilities:
 * 1. Hamburger open / close
 * 2. Open mobile Odds / Language modals
 * 3. Activate Odds / Language options
 * 4. Sync mobile ↔ desktop state
 * 5. Trigger Login / Register safely
 * 6. Open Bookmarks modal (Manage My Leagues)
 * 7. Mobile navigation accordion with Premium priority
 *
 * NO side effects
 * NO global click killers
 * NO desktop interference
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

        initialized = true;

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

        toggleBtn.addEventListener("click", (e) => {
            stop(e);
            openMenu();
        });

        closeBtn?.addEventListener("click", closeMenu);
        overlay.addEventListener("click", closeMenu);
        panel.addEventListener("click", (e) => e.stopPropagation());

        /* ==================================================
           MOBILE MODALS (ODDS / LANGUAGE / BOOKMARKS)
           Hamburger MUST stay open
        ================================================== */
        const openModal = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
        };

        const closeModal = (modal) => {
            if (!modal) return;
            modal.classList.remove("show");
        };

        qa(".be-modal-close").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                stop(e);
                closeModal(btn.closest(".be-modal-overlay"));
            });
        });

        qa(".be-modal-overlay").forEach((modal) => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });

        qs(".menu-odds")?.addEventListener("click", (e) => {
            stop(e);
            openModal(oddsModal);
        });

        qs(".menu-lang")?.addEventListener("click", (e) => {
            stop(e);
            openModal(langModal);
        });

        qs(".mobile-bookmarks-btn")?.addEventListener("click", (e) => {
            stop(e);
            openModal(bookmarksModal);
        });

        /* ==================================================
           AUTH (LOGIN / REGISTER)
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

        /* ==================================================
           NAVIGATION LOGIC
           - Locked section respected
           - Premium priority mode
        ================================================== */
        const submenus = qa(".submenu", panel);
        const links    = qa(".menu-link", panel);

        const closeAllSubmenus = (except = []) => {
            submenus.forEach((s) => {
                if (!except.includes(s)) s.classList.remove("open");
            });
        };

        links.forEach((link) => {
            link.addEventListener("click", (e) => {
                stop(e);

                const section = link.dataset.section;
                const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);
                if (!submenu) return;

                const isLocked   = link.dataset.lockOpen === "true";
                const isPremium  = link.dataset.premiumFocus === "true";

                if (isPremium) {
                    closeAllSubmenus([submenu]);
                    submenu.classList.add("open");
                    panel.classList.add("premium-focus");
                    return;
                }

                panel.classList.remove("premium-focus");

                submenus.forEach((s) => {
                    const parentLink = qs(`.menu-link[data-section="${s.dataset.subnav}"]`, panel);
                    const parentLocked = parentLink?.dataset.lockOpen === "true";

                    if (s === submenu) {
                        s.classList.toggle("open");
                    } else if (!parentLocked) {
                        s.classList.remove("open");
                    }
                });
            });
        });

        /* ==================================================
           ODDS ACTIVE + SYNC
        ================================================== */
        qa("#mobile-odds-modal .be-modal-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                stop(e);

                qa("#mobile-odds-modal .be-modal-item").forEach((i) => i.classList.remove("active"));
                item.classList.add("active");

                const oddsType = item.dataset.odds;
                const label = item.textContent.trim();

                qa(".header-desktop .odds-dropdown .item").forEach((i) => {
                    i.classList.toggle("active", i.dataset.odds === oddsType);
                });

                const desktopLabel = qs(".header-desktop .odds-label");
                if (desktopLabel) desktopLabel.textContent = label;

                closeModal(oddsModal);
            });
        });

        /* ==================================================
           LANGUAGE ACTIVE + SYNC
        ================================================== */
        qa("#mobile-language-modal .be-modal-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                stop(e);

                qa("#mobile-language-modal .be-modal-item").forEach((i) => i.classList.remove("active"));
                item.classList.add("active");

                const lang = item.dataset.lang;
                const label = item.textContent.trim();

                qa(".header-desktop .language-dropdown .item").forEach((i) => {
                    i.classList.toggle("active", i.dataset.lang === lang);
                });

                const desktopLang = qs(".header-desktop .lang-code");
                if (desktopLang) desktopLang.textContent = label;

                closeModal(langModal);
            });
        });

        console.log("header-mobile.js v6.4 READY");
    }

    document.addEventListener("headerLoaded", initHeaderMobile);
    document.addEventListener("DOMContentLoaded", initHeaderMobile);
})();
