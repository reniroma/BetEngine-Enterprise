/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v7.1)
 * Desktop + Mobile header behaviour
 * FIX: global listeners, state isolation, ESC priority
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * GLOBAL STATE (SINGLE SOURCE OF TRUTH)
     *******************************************************/
    let desktopListenersAttached = false;

    const state = {
        desktopDropdownOpen: false
    };

    /*******************************************************
     * UTILS
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

        state.desktopDropdownOpen = false;
    };

    /*******************************************************
     * DESKTOP DROPDOWNS
     *******************************************************/
    function initDesktopDropdowns() {
        const header = document.querySelector(".header-desktop");
        if (!header) return;

        /* ---------------- ODDS ---------------- */
        const oddsToggle   = header.querySelector(".odds-format .odds-toggle");
        const oddsDropdown = header.querySelector(".odds-dropdown");
        const oddsItems    = oddsDropdown?.querySelectorAll(".item") || [];
        const oddsLabel    = header.querySelector(".odds-label");

        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = oddsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) {
                    oddsDropdown.classList.add("show");
                    state.desktopDropdownOpen = true;
                }
            });

            oddsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const clean = item.textContent.split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    closeAllDesktopDropdowns();
                });
            });
        }

        /* ---------------- LANGUAGE ---------------- */
        const langToggle   = header.querySelector(".language-toggle");
        const langDropdown = header.querySelector(".language-dropdown");
        const langItems    = langDropdown?.querySelectorAll(".item") || [];
        const langLabel    = header.querySelector(".language-selector .lang-code");

        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = langDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) {
                    langDropdown.classList.add("show");
                    state.desktopDropdownOpen = true;
                }
            });

            langItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    if (langLabel) langLabel.textContent = item.textContent;

                    closeAllDesktopDropdowns();
                });
            });
        }

        /* ---------------- BETTING TOOLS ---------------- */
        const toolsTrigger  = header.querySelector(".sub-item-tools");
        const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

        if (toolsTrigger && toolsDropdown) {
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) {
                    toolsDropdown.classList.add("show");
                    state.desktopDropdownOpen = true;
                }
            });
        }
    }

    /*******************************************************
     * GLOBAL DESKTOP LISTENERS (SINGLETON)
     *******************************************************/
    function attachDesktopGlobalListeners() {
        if (desktopListenersAttached) return;
        desktopListenersAttached = true;

        document.addEventListener("click", (e) => {
            if (!state.desktopDropdownOpen) return;

            if (
                !isInside(e.target, ".odds-format") &&
                !isInside(e.target, ".language-selector") &&
                !isInside(e.target, ".sub-item-tools")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            if (!state.desktopDropdownOpen) return;

            closeAllDesktopDropdowns();
        });
    }

    /*******************************************************
     * NAVIGATION SYNC (UNCHANGED)
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub  = document.querySelectorAll(".row-sub .subnav-group");

        const activate = (section) => {
            dMain.forEach(i =>
                i.classList.toggle("active", i.dataset.section === section)
            );

            dSub.forEach(g =>
                g.classList.toggle("active", g.dataset.subnav === section)
            );
        };

        dMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    }

    /*******************************************************
     * DESKTOP AUTH MODALS (UNCHANGED)
     *******************************************************/
    function initDesktopAuth() {

        const loginOverlay    = document.getElementById("login-modal");
        const registerOverlay = document.getElementById("register-modal");

        if (!loginOverlay && !registerOverlay) return;

        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");

        const loginClose    = loginOverlay?.querySelector(".auth-close");
        const registerClose = registerOverlay?.querySelector(".auth-close");

        const authSwitches  = document.querySelectorAll(".auth-switch");

        const open = (overlay) => {
            overlay?.classList.add("show");
            lockBodyScroll(true);
        };

        const close = (overlay) => {
            overlay?.classList.remove("show");
            lockBodyScroll(false);
        };

        loginBtn?.addEventListener("click", () => {
            close(registerOverlay);
            open(loginOverlay);
        });

        registerBtn?.addEventListener("click", () => {
            close(loginOverlay);
            open(registerOverlay);
        });

        loginClose?.addEventListener("click", () => close(loginOverlay));
        registerClose?.addEventListener("click", () => close(registerOverlay));

        authSwitches.forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.authTarget;
                if (target === "login") {
                    close(registerOverlay);
                    open(loginOverlay);
                } else if (target === "register") {
                    close(loginOverlay);
                    open(registerOverlay);
                }
            });
        });

        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;

            if (loginOverlay?.classList.contains("show")) close(loginOverlay);
            if (registerOverlay?.classList.contains("show")) close(registerOverlay);
        });
    }

    /*******************************************************
     * INIT
     *******************************************************/
    function initHeader() {
        initDesktopDropdowns();
        attachDesktopGlobalListeners();
        initSectionNavigation();
        initDesktopAuth();
    }

    document.addEventListener("headerLoaded", initHeader);

    if (document.querySelector(".header-desktop")) {
        initHeader();
    }

});
