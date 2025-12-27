/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (SEARCH SAFE)
 *
 * PURPOSE
 * - Preserve 100% existing mobile behavior:
 *   hamburger, bookmarks, odds, language, auth, overlays
 * - Add ONLY a minimal, isolated mobile search toggle
 *
 * GUARANTEES
 * - No changes to existing modules or logic
 * - No body-lock, overlay, or menu state interaction
 * - Fully compatible with search.js and header-mobile.html
 *********************************************************/

(function () {
    let initialized = false;

    function initHeaderMobile() {
        if (initialized) return;
        initialized = true;

        /* ==================================================
           EXISTING LOGIC (UNCHANGED)
           --------------------------------------------------
           NOTE:
           This section intentionally mirrors the original
           stable header-mobile.js logic.
           NOTHING here is altered.
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

        const overlay   = qs(".mobile-menu-overlay");
        const panel     = qs(".mobile-menu-panel");
        const toggleBtn = qs(".mobile-menu-toggle");
        const closeBtn  = qs(".mobile-menu-close");

        const oddsModal      = qs("#mobile-odds-modal");
        const langModal      = qs("#mobile-language-modal");
        const bookmarksModal = qs("#mobile-bookmarks-modal");

        if (!overlay || !panel || !toggleBtn) return;

        const forceOddsOpen = () => {
            const oddsSub = qs('.submenu[data-subnav="odds"]', panel);
            if (oddsSub) oddsSub.classList.add("open");
        };

        const openMenu = () => {
            blurActive();

            overlay.classList.add("show");
            panel.classList.add("open");
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

        toggleBtn.addEventListener("click", (e) => {
            stop(e);
            openMenu();
        });

        closeBtn?.addEventListener("click", closeMenu);

        overlay.addEventListener("click", closeMenu);
        panel.addEventListener("click", (e) => e.stopPropagation());

        /* ==================================================
           MODALS (UNCHANGED)
        ================================================== */

        const openModal = (modal) => modal?.classList.add("show");
        const closeModal = (modal) => modal?.classList.remove("show");

        const openSheet = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
            requestAnimationFrame(() => modal.classList.add("is-open"));
        };

        const closeSheet = (modal) => {
            if (!modal) return;
            modal.classList.remove("is-open");

            const onEnd = (ev) => {
                if (ev.target !== modal) return;
                modal.removeEventListener("transitionend", onEnd);
                modal.classList.remove("show");
            };

            modal.addEventListener("transitionend", onEnd);
            setTimeout(() => {
                modal.removeEventListener("transitionend", onEnd);
                modal.classList.remove("show");
            }, 280);
        };

        qa(".be-modal-close").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                stop(e);
                const m = btn.closest(".be-modal-overlay");
                if (!m) return;
                (m.id === "mobile-odds-modal" || m.id === "mobile-language-modal")
                    ? closeSheet(m)
                    : closeModal(m);
            });
        });

        qa(".be-modal-overlay").forEach((m) => {
            m.addEventListener("click", (e) => {
                if (e.target !== m) return;
                (m.id === "mobile-odds-modal" || m.id === "mobile-language-modal")
                    ? closeSheet(m)
                    : closeModal(m);
            });
        });

        qs(".menu-odds")?.addEventListener("click", (e) => {
            stop(e);
            openSheet(oddsModal);
        });

        qs(".menu-lang")?.addEventListener("click", (e) => {
            stop(e);
            openSheet(langModal);
        });

        qs(".mobile-bookmarks-btn")?.addEventListener("click", (e) => {
            stop(e);
            openModal(bookmarksModal);
        });

        /* ==================================================
           AUTH (UNCHANGED)
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
           PREMIUM / ACCORDIONS (UNCHANGED)
        ================================================== */

        const premiumLink = qs('.menu-link[data-section="premium"]', panel);

        premiumLink?.addEventListener("click", (e) => {
            stop(e);

            const isActive = panel.classList.contains("premium-mode");
            if (isActive) {
                panel.classList.remove("premium-mode");
                qs('.submenu[data-subnav="premium"]', panel)?.classList.remove("open");
                qa(".submenu", panel).forEach((s) => {
                    if (s.dataset.subnav !== "odds" && s.dataset.subnav !== "premium") {
                        s.classList.remove("open");
                    }
                });
                forceOddsOpen();
                return;
            }

            panel.classList.add("premium-mode");
            qa(".submenu", panel).forEach((s) => {
                if (s.dataset.subnav !== "odds") s.classList.remove("open");
            });
            qs('.submenu[data-subnav="premium"]', panel)?.classList.add("open");
            forceOddsOpen();
        });

        qa('.menu-link:not([data-section="premium"]):not([data-section="odds"])', panel)
            .forEach((link) => {
                link.addEventListener("click", (e) => {
                    stop(e);
                    panel.classList.remove("premium-mode");
                    qs('.submenu[data-subnav="premium"]', panel)?.classList.remove("open");

                    const section = link.dataset.section;
                    const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);
                    if (!submenu) return;

                    const isOpen = submenu.classList.contains("open");
                    qa(".submenu", panel).forEach((s) => {
                        if (s.dataset.subnav !== "odds") s.classList.remove("open");
                    });

                    isOpen ? submenu.classList.remove("open") : submenu.classList.add("open");
                    forceOddsOpen();
                });
            });

        /* ==================================================
           MOBILE SEARCH (NEW – ISOLATED, SAFE)
           --------------------------------------------------
           - No interaction with menu / overlay / body-lock
           - search.js owns search logic
        ================================================== */

        const searchBtn   = qs(".mobile-search-btn");
        const searchPanel = qs(".mobile-search-inline");

        if (searchBtn && searchPanel) {
            searchBtn.addEventListener("click", (e) => {
                e.preventDefault();

                const isHidden = searchPanel.hasAttribute("hidden");

                if (isHidden) {
                    searchPanel.removeAttribute("hidden");

                    const input = qs(".be-search-input", searchPanel);
                    if (input) input.focus();
                } else {
                    searchPanel.setAttribute("hidden", "");
                }
            });

            searchPanel.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }

        console.log("header-mobile.js SEARCH SAFE READY");
    }

    document.addEventListener("DOMContentLoaded", initHeaderMobile);
    document.addEventListener("headerLoaded", initHeaderMobile);
})();
