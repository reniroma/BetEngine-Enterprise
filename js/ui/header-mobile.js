/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.7)
 * ACCESSIBILITY SAFE / PREMIUM STABLE
 *
 * MOBILE ONLY – NO DESKTOP INTERFERENCE
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
           HAMBURGER STATE (SAFE)
        ================================================== */
        const openMenu = () => {
            blurActive();
            overlay.classList.add("show");
            panel.classList.add("open");

            /* ===== FORCE ODDS ALWAYS OPEN ===== */
            const oddsSub = qs('.submenu[data-subnav="odds"]', panel);
            if (oddsSub) oddsSub.classList.add("open");

            document.body.style.overflow = "hidden";
            document.body.classList.add("menu-open");
        };

        const closeMenu = () => {
            blurActive();
            overlay.classList.remove("show");
            panel.classList.remove("open");
            panel.classList.remove("premium-mode");
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
           AUTH
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
           PREMIUM FOCUS MODE (TOGGLE FIXED)
        ================================================== */
        const premiumLink = qs('.menu-link[data-section="premium"]', panel);

        premiumLink?.addEventListener("click", (e) => {
            stop(e);

            const isActive = panel.classList.contains("premium-mode");

            if (isActive) {
                panel.classList.remove("premium-mode");

                qa(".submenu", panel).forEach((s) => {
                    if (s.dataset.subnav === "odds") {
                        s.classList.add("open");
                    } else {
                        s.classList.remove("open");
                    }
                });

                return;
            }

            panel.classList.add("premium-mode");

            const premiumSub = qs('.submenu[data-subnav="premium"]', panel);
            if (!premiumSub) return;

            qa(".submenu", panel).forEach((s) => {
                if (s !== premiumSub) s.classList.remove("open");
            });

            premiumSub.classList.add("open");
        });

        /* ==================================================
           NORMAL ACCORDION (ODDS ALWAYS OPEN)
        ================================================== */
        qa('.menu-link:not([data-section="premium"]):not([data-section="odds"])', panel)
            .forEach((link) => {
                link.addEventListener("click", (e) => {
                    stop(e);

                    panel.classList.remove("premium-mode");
                    
                    const section = link.dataset.section;
                    const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);
                    if (!submenu) return;
                    
                    const isOpen = submenu.classList.contains("open");
                    
                    // Close all submenus except odds
                    qa(".submenu", panel).forEach((s) => {
                        if (
                            s.dataset.subnav !== "odds" &&
                            s !== submenu
                        ) {
                            s.classList.remove("open");
                        }
                    });
    
                    // Toggle current submenu
                    if (!isOpen) {           
                        submenu.classList.remove("open");
                    } else {
                        submenu.classList.add("open");
                    }
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

        console.log("header-mobile.js v6.7 READY");
    }

    document.addEventListener("headerLoaded", initHeaderMobile);
    document.addEventListener("DOMContentLoaded", initHeaderMobile);
})();
