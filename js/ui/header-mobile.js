/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.8)
 * ACCESSIBILITY SAFE / PREMIUM STABLE
 *
 * MOBILE ONLY – NO DESKTOP INTERFERENCE
 *
 * FIX:
 * - Odds/Language modals behave as slide-up sheets
 * - Selection becomes active and modal closes reliably
 * - Preferences labels update after selection
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
        const panel = qs(".mobile-menu-panel");
        const toggleBtn = qs(".mobile-menu-toggle");
        const closeBtn = qs(".mobile-menu-close");

        const oddsModal = qs("#mobile-odds-modal");
        const langModal = qs("#mobile-language-modal");
        const bookmarksModal = qs("#mobile-bookmarks-modal");

        if (!overlay || !panel || !toggleBtn) return;
        initialized = true;

        /* ==================================================
           MOBILE ACCOUNT UI SYNC + USER DROPDOWN (JS ONLY)
           - Default: user nav closed
           - Toggle on click "testuser" header row
           - Sync username + guest/user visibility from BEAuth
        ================================================== */
        const accountSection = qs(".menu-section.account", panel);
        const guestBox = qs(".mobile-auth-guest", accountSection || panel);
        const userBox = qs(".mobile-auth-user", accountSection || panel);
        const userHeader = qs(".mobile-user-header", userBox || panel);
        const userNameEl = qs(".mobile-user-header .username", userBox || panel);
        const userNav = qs(".mobile-user-nav", userBox || panel);

        let userDropdownOpen = false;
        let userCaretEl = null;

        const getCaretColor = () => {
            const anchor = qs(".menu-section.navigation .menu-group[data-group='odds'] > .menu-link", panel)
                || qs(".menu-section.navigation .menu-link", panel);
            if (!anchor) return "#f4a11a";
            const c = getComputedStyle(anchor).color;
            return c || "#f4a11a";
        };

        const ensureUserHeaderInlineLayout = () => {
            if (!userHeader) return;

            userHeader.style.display = "flex";
            userHeader.style.alignItems = "center";
            userHeader.style.justifyContent = "space-between";
            userHeader.style.width = "100%";
            userHeader.style.cursor = "pointer";
            userHeader.style.userSelect = "none";
        };

        const ensureUserCaret = () => {
            if (!userHeader) return;
            if (userCaretEl && userCaretEl.isConnected) return;

            userCaretEl = document.createElement("span");
            userCaretEl.className = "be-user-caret";

            userCaretEl.style.display = "inline-block";
            userCaretEl.style.marginLeft = "10px";
            userCaretEl.style.flex = "0 0 auto";

            // Triangle caret (down by default)
            userCaretEl.style.width = "0";
            userCaretEl.style.height = "0";
            userCaretEl.style.borderLeft = "6px solid transparent";
            userCaretEl.style.borderRight = "6px solid transparent";
            userCaretEl.style.borderTop = `6px solid ${getCaretColor()}`;

            userHeader.appendChild(userCaretEl);
        };

        const setUserCaretDirection = (isOpen) => {
            if (!userCaretEl) return;
            const color = getCaretColor();

            if (isOpen) {
                userCaretEl.style.borderTop = "0";
                userCaretEl.style.borderLeft = "6px solid transparent";
                userCaretEl.style.borderRight = "6px solid transparent";
                userCaretEl.style.borderBottom = `6px solid ${color}`;
            } else {
                userCaretEl.style.borderBottom = "0";
                userCaretEl.style.borderLeft = "6px solid transparent";
                userCaretEl.style.borderRight = "6px solid transparent";
                userCaretEl.style.borderTop = `6px solid ${color}`;
            }
        };

        const closeUserDropdown = () => {
            userDropdownOpen = false;
            if (userNav) userNav.style.display = "none";
            setUserCaretDirection(false);
        };

        const toggleUserDropdown = () => {
            userDropdownOpen = !userDropdownOpen;
            if (userNav) userNav.style.display = userDropdownOpen ? "block" : "none";
            setUserCaretDirection(userDropdownOpen);
        };

        const syncMobileAccountUI = (state) => {
            const s = state || window.BEAuth?.getState?.() || { authenticated: false, user: null };

            if (s.authenticated) {
                if (guestBox) guestBox.style.display = "none";
                if (userBox) userBox.hidden = false;

                if (userNameEl) {
                    const name = s.user && s.user.username ? s.user.username : "";
                    userNameEl.textContent = name;
                }

                ensureUserHeaderInlineLayout();
                ensureUserCaret();
                closeUserDropdown();
            } else {
                if (guestBox) guestBox.style.display = "";
                if (userBox) userBox.hidden = true;
                closeUserDropdown();
            }
        };

        // Default closed (safe)
        if (userNav) userNav.style.display = "none";

        // Toggle on header click
        if (userHeader) {
            userHeader.addEventListener("click", (e) => {
                stop(e);
                toggleUserDropdown();
            });
        }

        /* ==================================================
           HAMBURGER STATE (SAFE)
        ================================================== */
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

            // Sync account UI on open (prevents stale state)
            syncMobileAccountUI();

            // PATCH (UI SYNC HOOK) — notify auth UI layer that panel is now visible
            document.dispatchEvent(new Event("be:mobileMenuOpened"));
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

            // Close user dropdown when menu closes
            closeUserDropdown();

            document.body.style.overflow = "";
            document.body.classList.remove("menu-open");
        };

        /* ==================================================
           AUTH STATE → UI SYNC (STRICT FIX)
           - On logout: close hamburger menu
        ================================================== */
        document.addEventListener("auth:changed", (e) => {
            const s = e?.detail || window.BEAuth?.getState?.() || { authenticated: false };

            syncMobileAccountUI(s);

            if (!s.authenticated) {
                // If menu is open during logout, force close
                if (document.body.classList.contains("menu-open") || panel.classList.contains("open")) {
                    closeMenu();
                }
            }
        });

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

        // Generic open/close (no animation)
        const openModal = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
        };

        const closeModal = (modal) => {
            if (!modal) return;
            modal.classList.remove("show");
        };

        // Slide-up sheet open/close (Odds/Language only)
        const openSheet = (modal) => {
            if (!modal) return;
            modal.classList.add("show");
            // next frame to allow transitions
            requestAnimationFrame(() => modal.classList.add("is-open"));
        };

        const closeSheet = (modal) => {
            if (!modal) return;

            // start animation out
            modal.classList.remove("is-open");

            // remove .show after transition ends
            const onEnd = (ev) => {
                if (ev.target !== modal) return;
                modal.removeEventListener("transitionend", onEnd);
                modal.classList.remove("show");
            };

            modal.addEventListener("transitionend", onEnd);

            // safety fallback (in case transitionend does not fire)
            setTimeout(() => {
                modal.removeEventListener("transitionend", onEnd);
                modal.classList.remove("show");
            }, 280);
        };

        // Close buttons
        qa(".be-modal-close").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                stop(e);
                const m = btn.closest(".be-modal-overlay");
                if (!m) return;

                if (m.id === "mobile-odds-modal" || m.id === "mobile-language-modal") {
                    closeSheet(m);
                } else {
                    closeModal(m);
                }
            });
        });

        // Click outside modal closes it
        qa(".be-modal-overlay").forEach((m) => {
            m.addEventListener("click", (e) => {
                if (e.target !== m) return;

                if (m.id === "mobile-odds-modal" || m.id === "mobile-language-modal") {
                    closeSheet(m);
                } else {
                    closeModal(m);
                }
            });
        });

        // Open Odds/Language as slide-up sheets
        qs(".menu-odds")?.addEventListener("click", (e) => {
            stop(e);
            openSheet(oddsModal);
        });

        qs(".menu-lang")?.addEventListener("click", (e) => {
            stop(e);
            openSheet(langModal);
        });

        // Keep bookmarks as normal modal
        qs(".mobile-bookmarks-btn")?.addEventListener("click", (e) => {
            stop(e);
            openModal(bookmarksModal);
        });

        /* ==================================================
           AUTH
           IMPORTANT:
           - Auth triggers are handled by header-auth.js
           - This avoids double-binding regressions
        ================================================== */

        /* ==================================================
           PREMIUM FOCUS MODE (TOGGLE FIXED)
        ================================================== */
        const premiumLink = qs('.menu-link[data-section="premium"]', panel);

        premiumLink?.addEventListener("click", (e) => {
            stop(e);

            const isActive = panel.classList.contains("premium-mode");

            if (isActive) {
                panel.classList.remove("premium-mode");

                const premiumSub = qs('.submenu[data-subnav="premium"]', panel);
                if (premiumSub) premiumSub.classList.remove("open");

                qa(".submenu", panel).forEach((s) => {
                    if (s.dataset.subnav !== "odds" && s.dataset.subnav !== "premium") {
                        s.classList.remove("open");
                    }
                });

                forceOddsOpen();
                return;
            }

            panel.classList.add("premium-mode");

            const premiumSub = qs('.submenu[data-subnav="premium"]', panel);
            if (!premiumSub) return;

            qa(".submenu", panel).forEach((s) => {
                if (s.dataset.subnav !== "odds") s.classList.remove("open");
            });

            premiumSub.classList.add("open");
            forceOddsOpen();
        });

        /* ==================================================
           NORMAL ACCORDION (NON-PREMIUM)
        ================================================== */
        qa('.menu-link:not([data-section="premium"]):not([data-section="odds"])', panel)
            .forEach((link) => {
                link.addEventListener("click", (e) => {
                    stop(e);

                    panel.classList.remove("premium-mode");
                    const premiumSub = qs('.submenu[data-subnav="premium"]', panel);
                    if (premiumSub) premiumSub.classList.remove("open");

                    const section = link.dataset.section;
                    const submenu = qs(`.submenu[data-subnav="${section}"]`, panel);
                    if (!submenu) return;

                    const isOpen = submenu.classList.contains("open");

                    qa(".submenu", panel).forEach((s) => {
                        if (s.dataset.subnav !== "odds") s.classList.remove("open");
                    });

                    if (!isOpen) submenu.classList.add("open");
                    else submenu.classList.remove("open");

                    forceOddsOpen();
                });
            });

        /* ==================================================
           ODDS ACTIVE + SYNC + CLOSE
        ================================================== */
        qa("#mobile-odds-modal .be-modal-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                stop(e);

                qa("#mobile-odds-modal .be-modal-item").forEach((i) => i.classList.remove("active"));
                item.classList.add("active");

                const oddsType = item.dataset.odds;
                const label = item.textContent.trim();

                // Update Preferences label in mobile menu
                const oddsValue = qs(".menu-section.preferences .menu-item.menu-odds .value", panel);
                if (oddsValue) oddsValue.textContent = label;

                // Optional: sync desktop state label (no desktop logic changes)
                qa(".header-desktop .odds-dropdown .item").forEach((i) => {
                    i.classList.toggle("active", i.dataset.odds === oddsType);
                });

                const desktopLabel = qs(".header-desktop .odds-label");
                if (desktopLabel) desktopLabel.textContent = label;

                closeSheet(oddsModal);
            });
        });

        /* ==================================================
           LANGUAGE ACTIVE + SYNC + CLOSE
        ================================================== */
        qa("#mobile-language-modal .be-modal-item").forEach((item) => {
            item.addEventListener("click", (e) => {
                stop(e);

                qa("#mobile-language-modal .be-modal-item").forEach((i) => i.classList.remove("active"));
                item.classList.add("active");

                const lang = item.dataset.lang;
                const label = item.textContent.trim();

                // Update Preferences label in mobile menu
                const langValue = qs(".menu-section.preferences .menu-item.menu-lang .value", panel);
                if (langValue) langValue.textContent = label;

                // Optional: sync desktop state label (no desktop logic changes)
                qa(".header-desktop .language-dropdown .item").forEach((i) => {
                    i.classList.toggle("active", i.dataset.lang === lang);
                });

                const desktopLang = qs(".header-desktop .lang-code");
                if (desktopLang) desktopLang.textContent = label;

                closeSheet(langModal);
            });
        });

        console.log("header-mobile.js v6.8 READY");
    }

    document.addEventListener("headerLoaded", initHeaderMobile);
    document.addEventListener("DOMContentLoaded", initHeaderMobile);
})();
