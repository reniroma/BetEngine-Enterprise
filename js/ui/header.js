/*********************************************************
 * BetEngine Enterprise – HEADER JS (v9.0 ENTERPRISE)
 * Desktop dropdowns + Mobile modal + Navigation sync
 * Ultra-stable: init-once, safe selectors, compatible
 * me header-loader.js ("headerLoaded" event).
 *********************************************************/

(function () {
    "use strict";

    let initialized = false;

    /*******************************************************
     * UTILITY FUNCTIONS
     *******************************************************/
    const closeAllDesktopDropdowns = () => {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    };

    const isInside = (target, selector) =>
        !!(target && target.closest && target.closest(selector));

    const lockBodyScroll = (state) => {
        document.body.style.overflow = state ? "hidden" : "";
    };

    /*******************************************************
     * DESKTOP: ODDS + LANGUAGE + TOOLS
     *******************************************************/
    function initDesktopDropdowns() {
        /* --------- ODDS ---------- */
        const oddsToggle   = document.querySelector(".odds-format .odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");
        const oddsItems    = oddsDropdown ? oddsDropdown.querySelectorAll(".item") : [];
        const oddsLabel    = document.querySelector(".odds-label");

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

                    const clean = item.textContent.split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    const mobileOdds = document.querySelector(".mobile-odds-toggle .value");
                    if (mobileOdds) mobileOdds.textContent = clean;

                    oddsDropdown.classList.remove("show");
                });
            });
        }

        /* --------- LANGUAGE ---------- */
        const langToggle   = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");
        const langItems    = langDropdown ? langDropdown.querySelectorAll(".item") : [];
        const langLabel    = document.querySelector(".language-toggle .lang-code");

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

                    const label = item.textContent;
                    const code  = (item.dataset.lang || "en").toUpperCase();

                    if (langLabel) langLabel.textContent = label;

                    const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = code;

                    langDropdown.classList.remove("show");
                });
            });
        }

        /* --------- BETTING TOOLS ---------- */
        const toolsTrigger  = document.querySelector(".sub-item-tools");
        const toolsDropdown = toolsTrigger
            ? toolsTrigger.querySelector(".tools-dropdown")
            : null;
        const toolsItems    = toolsDropdown ? toolsDropdown.querySelectorAll(".item") : [];

        if (toolsTrigger && toolsDropdown) {
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) toolsDropdown.classList.add("show");
            });

            toolsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    // Future logic for tools item click
                });
            });
        }

        /* --------- CLOSE ON OUTSIDE CLICK ---------- */
        document.addEventListener("click", (e) => {
            if (
                !isInside(e.target, ".odds-format") &&
                !isInside(e.target, ".language-selector") &&
                !isInside(e.target, ".sub-item-tools") &&
                !isInside(e.target, ".tools-dropdown")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        /* --------- CLOSE ON ESC ---------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllDesktopDropdowns();
        });
    }

    /*******************************************************
     * NAVIGATION SYNC (Desktop + Mobile)
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub  = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub  = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        if (!dMain.length && !mMain.length) return;

        const activate = (section) => {
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
        const modal = document.getElementById("mobile-header-modal");
        if (!modal) return;

        const title    = modal.querySelector(".be-modal-title");
        const sections = modal.querySelectorAll(".be-modal-section");
        const closeBtn = modal.querySelector(".be-modal-close");

        const mOdds  = document.querySelector(".mobile-odds-toggle");
        const mLang  = document.querySelector(".mobile-lang-toggle");
        const mTools = document.querySelector(".mobile-tools-trigger");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            const activeSection = modal.querySelector(".modal-" + type);
            if (activeSection) activeSection.classList.add("active");

            if (title) title.textContent = label;

            modal.classList.add("show");
            modal.dataset.current = type;
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        mOdds && mOdds.addEventListener("click", () =>
            showSection("odds", "Select odds format")
        );
        mLang && mLang.addEventListener("click", () =>
            showSection("language", "Select language")
        );
        mTools && mTools.addEventListener("click", () =>
            showSection("tools", "Betting tools")
        );

        closeBtn && closeBtn.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });

        // Internal choices
        sections.forEach(section => {
            section.querySelectorAll(".be-modal-item").forEach(item => {
                item.addEventListener("click", () => {
                    const type = modal.dataset.current;

                    if (type === "odds") {
                        const clean = item.textContent.split("(")[0].trim();
                        const desktopLabel = document.querySelector(".odds-label");
                        const mobileLabel  = document.querySelector(".mobile-odds-toggle .value");
                        if (desktopLabel) desktopLabel.textContent = clean;
                        if (mobileLabel)  mobileLabel.textContent  = clean;
                    }

                    if (type === "language") {
                        const txt  = item.textContent;
                        const code = (item.dataset.lang || "en").toUpperCase();

                        const desktopLang = document.querySelector(".language-toggle .lang-code");
                        const mobileLang  = document.querySelector(".mobile-lang-toggle .lang-code");

                        if (desktopLang) desktopLang.textContent = txt;
                        if (mobileLang)  mobileLang.textContent  = code;
                    }

                    closeModal();
                });
            });
        });
    }

    /*******************************************************
     * DESKTOP AUTH MODAL (Login / Register)
     *******************************************************/
    function initDesktopAuth() {
        const overlay = document.querySelector(".be-auth-overlay");
        if (!overlay) return;

        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");
        const closeBtn    = overlay.querySelector(".auth-close");
        const title       = overlay.querySelector(".auth-header span");

        const openModal = (type) => {
            if (title) {
                title.textContent = type === "login" ? "Login" : "Register";
            }
            overlay.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            overlay.classList.remove("show");
            lockBodyScroll(false);
        };

        loginBtn && loginBtn.addEventListener("click", () => openModal("login"));
        registerBtn && registerBtn.addEventListener("click", () => openModal("register"));
        closeBtn && closeBtn.addEventListener("click", closeModal);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && overlay.classList.contains("show")) {
                closeModal();
            }
        });
    }

    /*******************************************************
     * INIT-ONCE WRAPPER
     *******************************************************/
    function initHeaderModules() {
        if (initialized) return;
        if (!document.querySelector(".header-desktop")) return;

        initialized = true;

        initDesktopDropdowns();
        initSectionNavigation();
        initMobileModal();
        initDesktopAuth();

        console.log("BetEngine Enterprise – header.js initialized");
    }

    /*******************************************************
     * EVENT WIRING
     *******************************************************/
    // 1) Kur loader mbaron, lëshon "headerLoaded"
    document.addEventListener("headerLoaded", initHeaderModules);

    // 2) Fallback në rast se header është inline ose event u lëshua më herët
    if (document.readyState !== "loading") {
        setTimeout(initHeaderModules, 0);
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(initHeaderModules, 0);
        });
    }
})();
