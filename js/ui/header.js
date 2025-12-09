/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v5.0)
 * Desktop dropdowns + Mobile modal + Navigation sync
 * Auth modal with Login/Register tabs (responsive).
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * BASIC UTILITIES (LOCAL TO HEADER)
     *******************************************************/
    const hasDesktopHeader = !!document.querySelector(".header-desktop");
    const hasMobileHeader  = !!document.querySelector(".header-mobile");

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
     * DESKTOP: ODDS / LANGUAGE / TOOLS DROPDOWNS
     *******************************************************/
    function initDesktopDropdowns() {
        if (!hasDesktopHeader) return;

        /* ---------------- ODDS ---------------- */
        const oddsToggle   = document.querySelector(".odds-format .odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");
        const oddsItems    = oddsDropdown?.querySelectorAll(".item") || [];
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

        /* ---------------- LANGUAGE ---------------- */
        const langToggle   = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");
        const langItems    = langDropdown?.querySelectorAll(".item") || [];
        const langLabel    = document.querySelector(".lang-code");

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
                    const code  = (item.dataset.lang || "EN").toUpperCase();

                    if (langLabel) langLabel.textContent = label;

                    const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = code;

                    langDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- BETTING TOOLS ---------------- */
        const toolsTrigger  = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");
        const toolsItems    = toolsDropdown?.querySelectorAll(".item") || [];

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
                    // Placeholder for future tool actions.
                });
            });
        }

        /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
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

        /* ---------------- CLOSE ON ESC ---------------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeAllDesktopDropdowns();
            }
        });
    }

    /*******************************************************
     * DESKTOP + MOBILE SECTION NAVIGATION SYNC
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub  = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub  = document.querySelectorAll(".mobile-sub-nav .subnav-group");

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
     * MOBILE: MODAL (ODDS / LANGUAGE / TOOLS)
     *******************************************************/
    function initMobileModal() {
        if (!hasMobileHeader) return;

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
            const activeSection = modal.querySelector(`.modal-${type}`);
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

        /* Open triggers */
        mOdds?.addEventListener("click", () => {
            showSection("odds", "Select odds format");
        });

        mLang?.addEventListener("click", () => {
            showSection("language", "Select language");
        });

        mTools?.addEventListener("click", () => {
            showSection("tools", "Betting tools");
        });

        /* Close button */
        closeBtn?.addEventListener("click", closeModal);

        /* Outside click */
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        /* ESC key for modal only */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });

        /* Item selection (sync with desktop labels) */
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
                        const code = (item.dataset.lang || "EN").toUpperCase();

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
     * DESKTOP AUTH MODAL (LOGIN / REGISTER TABS)
     *******************************************************/
    function initDesktopAuth() {
        if (!hasDesktopHeader) return;

        const overlay = document.querySelector(".be-auth-overlay");
        if (!overlay) return;

        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");
        const closeBtn    = overlay.querySelector(".auth-close");
        const titleEl     = overlay.querySelector(".auth-header span");

        // Tabs and panes
        const tabs  = overlay.querySelectorAll(".auth-tab");
        const panes = overlay.querySelectorAll(".auth-pane");

        const paneLogin    = overlay.querySelector('[data-auth-pane="login"]');
        const paneRegister = overlay.querySelector('[data-auth-pane="register"]');

        // In-modal switches (links)
        const switches = overlay.querySelectorAll("[data-auth-switch]");

        const setActiveMode = (mode) => {
            // Tabs
            tabs.forEach(tab => {
                const tabMode = tab.getAttribute("data-auth-tab");
                tab.classList.toggle("active", tabMode === mode);
            });

            // Panes
            panes.forEach(pane => {
                const paneMode = pane.getAttribute("data-auth-pane");
                pane.classList.toggle("active", paneMode === mode);
            });

            // Title
            if (titleEl) {
                titleEl.textContent = mode === "register" ? "Create account" : "Login";
            }
        };

        const openModal = (mode) => {
            const targetMode = mode === "register" ? "register" : "login";
            setActiveMode(targetMode);
            overlay.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            overlay.classList.remove("show");
            lockBodyScroll(false);
        };

        // Header buttons
        loginBtn?.addEventListener("click", () => openModal("login"));
        registerBtn?.addEventListener("click", () => openModal("register"));

        // Close button
        closeBtn?.addEventListener("click", closeModal);

        // Overlay outside click
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // ESC key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && overlay.classList.contains("show")) {
                closeModal();
            }
        });

        // Tab click
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const mode = tab.getAttribute("data-auth-tab");
                if (mode) setActiveMode(mode);
            });
        });

        // In-modal switches (footer links)
        switches.forEach(btn => {
            btn.addEventListener("click", () => {
                const mode = btn.getAttribute("data-auth-switch");
                if (mode) setActiveMode(mode);
            });
        });

        // Ensure default state is login pane visible
        setActiveMode("login");
    }

    /*******************************************************
     * HEADER INIT LIFECYCLE
     *******************************************************/
    const initHeaderModules = () => {
        initDesktopDropdowns();
        initSectionNavigation();
        initMobileModal();
        initDesktopAuth();
    };

    // Preferred: headerLoaded event fired by header-loader.js
    document.addEventListener("headerLoaded", () => {
        initHeaderModules();
    });

    // Fallback: if headerLoaded is not dispatched but header exists
    if (hasDesktopHeader || hasMobileHeader) {
        setTimeout(() => {
            initHeaderModules();
        }, 0);
    }

});
