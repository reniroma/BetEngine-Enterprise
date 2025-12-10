/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL v5.0)
 * FIX: Separate login/register overlays + outside click
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

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
        const oddsItems    = oddsDropdown ? oddsDropdown.querySelectorAll(".item") : [];
        const oddsLabel    = header.querySelector(".odds-label");

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
        const langToggle   = header.querySelector(".language-toggle");
        const langDropdown = header.querySelector(".language-dropdown");
        const langItems    = langDropdown ? langDropdown.querySelectorAll(".item") : [];
        const langLabel    = header.querySelector(".lang-code");

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
        const toolsTrigger  = header.querySelector(".sub-item-tools");
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
        }

        /* ---------------- CLOSE ON OUTSIDE ---------------- */
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
            if (e.key === "Escape") closeAllDesktopDropdowns();
        });
    }


    /*******************************************************
     * NAVIGATION SYNC
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub  = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub  = document.querySelectorAll(".mobile-sub-nav .subnav-group");

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
     * MOBILE MODAL (unchanged)
     *******************************************************/
    function initMobileModal() {
        const mobileHeader = document.querySelector(".header-mobile");
        if (!mobileHeader) return;

        const modal = document.getElementById("mobile-header-modal");
        if (!modal) return;

        const title    = modal.querySelector(".be-modal-title");
        const sections = modal.querySelectorAll(".be-modal-section");
        const closeBtn = modal.querySelector(".be-modal-close");

        const mOdds  = mobileHeader.querySelector(".mobile-odds-toggle");
        const mLang  = mobileHeader.querySelector(".mobile-lang-toggle");
        const mTools = mobileHeader.querySelector(".mobile-tools-trigger");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            modal.querySelector(`.modal-${type}`).classList.add("active");

            title.textContent = label;

            modal.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        mOdds?.addEventListener("click", () => showSection("odds", "Select odds format"));
        mLang?.addEventListener("click", () => showSection("language", "Select language"));
        mTools?.addEventListener("click", () => showSection("tools", "Betting tools"));

        closeBtn?.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
        });
    }


    /*******************************************************
     * DESKTOP AUTH MODALS (FIXED)
     *******************************************************/
    function initDesktopAuth() {

        const loginOverlay    = document.getElementById("login-modal");
        const registerOverlay = document.getElementById("register-modal");

        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");

        const loginClose  = loginOverlay?.querySelector(".auth-close");
        const registerClose = registerOverlay?.querySelector(".auth-close");

        /* ----- OPEN LOGIN ----- */
        loginBtn?.addEventListener("click", () => {
            loginOverlay.classList.add("show");
            lockBodyScroll(true);
        });

        /* ----- OPEN REGISTER ----- */
        registerBtn?.addEventListener("click", () => {
            registerOverlay.classList.add("show");
            lockBodyScroll(true);
        });

        /* ----- CLOSE LOGIN ----- */
        loginClose?.addEventListener("click", () => {
            loginOverlay.classList.remove("show");
            lockBodyScroll(false);
        });

        /* ----- CLOSE REGISTER ----- */
        registerClose?.addEventListener("click", () => {
            registerOverlay.classList.remove("show");
            lockBodyScroll(false);
        });

        /* ----- OUTSIDE CLICK FIX ----- */
        loginOverlay?.addEventListener("click", (e) => {
            if (e.target === loginOverlay) {
                loginOverlay.classList.remove("show");
                lockBodyScroll(false);
            }
        });

        registerOverlay?.addEventListener("click", (e) => {
            if (e.target === registerOverlay) {
                registerOverlay.classList.remove("show");
                lockBodyScroll(false);
            }
        });

        /* ----- ESCAPE KEY ----- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (loginOverlay?.classList.contains("show")) {
                    loginOverlay.classList.remove("show");
                    lockBodyScroll(false);
                }
                if (registerOverlay?.classList.contains("show")) {
                    registerOverlay.classList.remove("show");
                    lockBodyScroll(false);
                }
            }
        });
    }


    /*******************************************************
     * INIT ALL HEADER MODULES
     *******************************************************/
    const initHeaderModules = () => {
        initDesktopDropdowns();
        initSectionNavigation();
        initMobileModal();
        initDesktopAuth();
    };

    document.addEventListener("headerLoaded", () => initHeaderModules());

    if (document.querySelector(".header-desktop") || document.querySelector(".header-mobile")) {
        setTimeout(() => initHeaderModules(), 0);
    }

});
