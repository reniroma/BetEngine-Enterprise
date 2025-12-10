/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL v6.0)
 * Desktop dropdowns, nav sync, mobile modal (odds/lang/tools)
 * No auth logic here (handled by header-auth.js).
 *********************************************************/

(() => {

    /*******************************************************
     * GUARD – prevent double initialization
     *******************************************************/
    let headerInitialized = false;

    /*******************************************************
     * HELPERS
     *******************************************************/
    const isInside = (target, selector) => {
        return !!(target && target.closest(selector));
    };

    const lockBodyScroll = (state) => {
        document.body.style.overflow = state ? "hidden" : "";
    };

    const closeAllDesktopDropdowns = () => {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    };

    /*******************************************************
     * DESKTOP DROPDOWNS (Odds / Language / Tools)
     *******************************************************/
    function initDesktopDropdowns() {
        const header = document.querySelector(".header-desktop");
        if (!header) return;

        /***********************
         * ODDS DROPDOWN
         ***********************/
        const oddsToggle = header.querySelector(".odds-format .odds-toggle, .odds-toggle");
        const oddsDropdown = header.querySelector(".odds-dropdown");
        const oddsItems = oddsDropdown ? oddsDropdown.querySelectorAll(".item") : [];
        const oddsValueDesktop =
            header.querySelector(".odds-toggle .value") ||
            header.querySelector(".odds-label");

        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = oddsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) oddsDropdown.classList.add("show");
            });

            oddsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    // Clean label: text before "("
                    const clean = item.textContent.split("(")[0].trim();

                    if (oddsValueDesktop) {
                        oddsValueDesktop.textContent = clean;
                    }

                    // Sync mobile quick button if exists
                    const mobileOddsValue =
                        document.querySelector(".mobile-odds-toggle .value") ||
                        document.querySelector(".mobile-odds-toggle .label");
                    if (mobileOddsValue) {
                        mobileOddsValue.textContent = clean;
                    }

                    oddsDropdown.classList.remove("show");
                });
            });
        }

        /***********************
         * LANGUAGE DROPDOWN
         ***********************/
        const langToggle =
            header.querySelector(".language-selector .language-toggle") ||
            header.querySelector(".language-toggle");
        const langDropdown = header.querySelector(".language-dropdown");
        const langItems = langDropdown ? langDropdown.querySelectorAll(".item") : [];
        const langLabelDesktop =
            header.querySelector(".language-toggle .lang-code") ||
            header.querySelector(".language-toggle .value") ||
            header.querySelector(".language-toggle .label");

        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = langDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) langDropdown.classList.add("show");
            });

            langItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const label = item.textContent.trim();
                    const code = (item.dataset.lang || "en").toUpperCase();

                    if (langLabelDesktop) {
                        langLabelDesktop.textContent = label;
                    }

                    // Sync mobile quick button if exists
                    const mobileLangCode =
                        document.querySelector(".mobile-lang-toggle .lang-code") ||
                        document.querySelector(".mobile-lang-toggle .value");
                    if (mobileLangCode) {
                        mobileLangCode.textContent = code;
                    }

                    langDropdown.classList.remove("show");
                });
            });
        }

        /***********************
         * BETTING TOOLS DROPDOWN
         ***********************/
        const toolsTrigger = header.querySelector(".sub-item-tools");
        const toolsDropdown = toolsTrigger
            ? toolsTrigger.querySelector(".tools-dropdown")
            : null;

        if (toolsTrigger && toolsDropdown) {
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) toolsDropdown.classList.add("show");
            });
        }

        /***********************
         * CLOSE ON OUTSIDE CLICK
         ***********************/
        document.addEventListener("click", (e) => {
            if (
                !isInside(e.target, ".odds-format") &&
                !isInside(e.target, ".odds-toggle") &&
                !isInside(e.target, ".language-selector") &&
                !isInside(e.target, ".language-toggle") &&
                !isInside(e.target, ".sub-item-tools") &&
                !isInside(e.target, ".tools-dropdown")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        /***********************
         * CLOSE ON ESC
         ***********************/
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllDesktopDropdowns();
            }
        });
    }

    /*******************************************************
     * NAVIGATION SYNC – desktop <-> mobile
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        if (!dMain.length && !mMain.length) return;

        const activate = (section) => {
            if (!section) return;

            dMain.forEach(i =>
                i.classList.toggle("active", i.dataset.section === section)
            );
            dSub.forEach(g =>
                g.classList.toggle("active", g.dataset.subnav === section)
            );

            mMain.forEach(i =>
                i.classList.toggle("active", i.dataset.section === section)
            );
            mSub.forEach(g =>
                g.classList.toggle("active", g.dataset.subnav === section)
            );
        };

        dMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });

        mMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    }

    /*******************************************************
     * MOBILE MODAL (Odds / Language / Tools)
     *******************************************************/
    function initMobileModal() {
        const mobileHeader = document.querySelector(".header-mobile");
        if (!mobileHeader) return;

        const modal = document.getElementById("mobile-header-modal");
        if (!modal) return;

        const title = modal.querySelector(".be-modal-title");
        const sections = modal.querySelectorAll(".be-modal-section");
        const closeBtn = modal.querySelector(".be-modal-close");

        const mOdds = mobileHeader.querySelector(".mobile-odds-toggle");
        const mLang = mobileHeader.querySelector(".mobile-lang-toggle");
        const mTools = mobileHeader.querySelector(".mobile-tools-trigger");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            const activeSection = modal.querySelector(`.modal-${type}`);
            if (activeSection) {
                activeSection.classList.add("active");
            }

            if (title && label) {
                title.textContent = label;
            }

            modal.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        mOdds?.addEventListener("click", () =>
            showSection("odds", "Select odds format")
        );
        mLang?.addEventListener("click", () =>
            showSection("language", "Select language")
        );
        mTools?.addEventListener("click", () =>
            showSection("tools", "Betting tools")
        );

        closeBtn?.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });

        /***********************
         * MOBILE MODAL ITEMS – SYNC ME DESKTOP + MOBILE
         ***********************/

        // ODDS items
        modal.querySelectorAll(".modal-odds .be-modal-item[data-odds]")
            .forEach(item => {
                item.addEventListener("click", () => {
                    const clean = item.textContent.split("(")[0].trim();

                    // desktop
                    const oddsValueDesktop =
                        document.querySelector(".header-desktop .odds-toggle .value") ||
                        document.querySelector(".header-desktop .odds-label");
                    if (oddsValueDesktop) {
                        oddsValueDesktop.textContent = clean;
                    }

                    // mobile
                    const mobileOddsValue =
                        document.querySelector(".mobile-odds-toggle .value") ||
                        document.querySelector(".mobile-odds-toggle .label");
                    if (mobileOddsValue) {
                        mobileOddsValue.textContent = clean;
                    }

                    closeModal();
                });
            });

        // LANGUAGE items
        modal.querySelectorAll(".modal-language .be-modal-item[data-lang]")
            .forEach(item => {
                item.addEventListener("click", () => {
                    const label = item.textContent.trim();
                    const code = (item.dataset.lang || "en").toUpperCase();

                    // desktop
                    const langLabelDesktop =
                        document.querySelector(".header-desktop .language-toggle .lang-code") ||
                        document.querySelector(".header-desktop .language-toggle .value") ||
                        document.querySelector(".header-desktop .language-toggle .label");
                    if (langLabelDesktop) {
                        langLabelDesktop.textContent = label;
                    }

                    // mobile
                    const mobileLangCode =
                        document.querySelector(".mobile-lang-toggle .lang-code") ||
                        document.querySelector(".mobile-lang-toggle .value");
                    if (mobileLangCode) {
                        mobileLangCode.textContent = code;
                    }

                    closeModal();
                });
            });

        // TOOLS items – thjesht mbyll modal për tani
        modal.querySelectorAll(".modal-tools .be-modal-item")
            .forEach(item => {
                item.addEventListener("click", () => {
                    closeModal();
                });
            });
    }

    /*******************************************************
     * INIT ALL HEADER MODULES
     *******************************************************/
    const initHeaderModules = () => {
        if (headerInitialized) return;
        headerInitialized = true;

        initDesktopDropdowns();
        initSectionNavigation();
        initMobileModal();
    };

    /*******************************************************
     * EVENT WIRING
     *******************************************************/
    // Preferojmë "headerLoaded" kur punon header-loader.js
    document.addEventListener("headerLoaded", initHeaderModules);

    // Fallback nëse headerët janë në HTML direkt pa loader
    if (document.readyState === "complete" || document.readyState === "interactive") {
        if (document.querySelector(".header-desktop") || document.querySelector(".header-mobile")) {
            initHeaderModules();
        }
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            if (document.querySelector(".header-desktop") || document.querySelector(".header-mobile")) {
                initHeaderModules();
            }
        });
    }

})();
