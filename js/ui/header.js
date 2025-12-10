/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL v6.0)
 * Desktop dropdowns, nav sync, mobile modal,
 * unified auth (login + register).
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
     * DESKTOP DROPDOWNS (ODDS / LANGUAGE / TOOLS)
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

                    // Text pa pjesën në kllapa
                    const clean = item.textContent.split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    // Sync me mobile chips (nëse ekziston)
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
        const langLabel    = header.querySelector(".language-selector .lang-code");

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
                    const code  = (item.dataset.lang || "EN").toUpperCase();

                    // Desktop label (teksti i plotë – p.sh. "English")
                    if (langLabel) langLabel.textContent = label;

                    // Sync me mobile lang code (p.sh. "EN")
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
     * NAVIGATION SYNC (DESKTOP <-> MOBILE)
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

        // Desktop nav
        dMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });

        // Mobile chips
        mMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    }

    /*******************************************************
     * MOBILE CONTROLS MODAL (ODDS / LANGUAGE / TOOLS)
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

            const active = modal.querySelector(`.modal-${type}`);
            if (active) active.classList.add("active");

            if (title && label) title.textContent = label;

            modal.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        /* OPENERS */
        mOdds?.addEventListener("click", () =>
            showSection("odds", "Select odds format")
        );

        mLang?.addEventListener("click", () =>
            showSection("language", "Select language")
        );

        mTools?.addEventListener("click", () =>
            showSection("tools", "Betting tools")
        );

        /* CLOSE */
        closeBtn?.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });

        /* SYNC ODDS SELECTION (MOBILE MODAL -> MOBILE CHIP + DESKTOP LABEL) */
        const oddsItems = modal.querySelectorAll(".modal-odds .be-modal-item");
        oddsItems.forEach(btn => {
            btn.addEventListener("click", () => {
                const clean = btn.textContent.split("(")[0].trim();

                const mobileValue = document.querySelector(".mobile-odds-toggle .value");
                if (mobileValue) mobileValue.textContent = clean;

                const desktopLabel = document.querySelector(".header-desktop .odds-label");
                if (desktopLabel) desktopLabel.textContent = clean;

                // Mark active edhe te desktop dropdown nëse ekziston
                const dDropdown = document.querySelector(".header-desktop .odds-dropdown");
                if (dDropdown) {
                    dDropdown.querySelectorAll(".item").forEach(i => i.classList.remove("active"));
                    // gjej item me të njëjtin data-odds
                    const key = btn.dataset.odds;
                    if (key) {
                        const match = dDropdown.querySelector(`.item[data-odds="${key}"]`);
                        if (match) match.classList.add("active");
                    }
                }

                closeModal();
            });
        });

        /* SYNC LANGUAGE SELECTION (MOBILE MODAL -> MOBILE LANG + DESKTOP LABEL) */
        const langItems = modal.querySelectorAll(".modal-language .be-modal-item");
        langItems.forEach(btn => {
            btn.addEventListener("click", () => {
                const label = btn.textContent.trim();
                const code  = (btn.dataset.lang || "").toUpperCase();

                const mobileCode = document.querySelector(".mobile-lang-toggle .lang-code");
                if (mobileCode && code) mobileCode.textContent = code;

                const desktopLabel = document.querySelector(".header-desktop .language-selector .lang-code");
                if (desktopLabel) desktopLabel.textContent = label;

                // Active state në desktop dropdown
                const dDropdown = document.querySelector(".header-desktop .language-dropdown");
                if (dDropdown) {
                    dDropdown.querySelectorAll(".item").forEach(i => i.classList.remove("active"));
                    const key = btn.dataset.lang;
                    if (key) {
                        const match = dDropdown.querySelector(`.item[data-lang="${key}"]`);
                        if (match) match.classList.add("active");
                    }
                }

                closeModal();
            });
        });

        /* TOOLS – tani vetëm mbyll modal kur klikohen (logjika reale do vijë më vonë) */
        const toolItems = modal.querySelectorAll(".modal-tools .be-modal-item");
        toolItems.forEach(btn => {
            btn.addEventListener("click", () => {
                // këtu më vonë mund të lidhim direct me faqe/sekcione
                closeModal();
            });
        });
    }

    /*******************************************************
     * UNIFIED AUTH SYSTEM (LOGIN + REGISTER)
     * Përdor ID-t reale: #auth-login dhe #register-modal
     *******************************************************/
    function initDesktopAuth() {

        // Overlays reale nga auth-login.html & auth-register.html
        const loginOverlay    = document.getElementById("auth-login");
        const registerOverlay = document.getElementById("register-modal");

        if (!loginOverlay && !registerOverlay) return;

        // Butonat në header
        const loginBtn    = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");

        // Butonat e mbylljes brenda modalit
        const loginClose =
            loginOverlay.querySelector("[data-auth-close]") ||
            loginOverlay.querySelector(".auth-close");

        const registerClose =
            registerOverlay.querySelector("[data-auth-close]") ||
            registerOverlay.querySelector(".auth-close");

        const openLogin = () => {
            if (!loginOverlay) return;
            registerOverlay?.classList.remove("show");
            loginOverlay.classList.add("show");
            lockBodyScroll(true);
        };

        const openRegister = () => {
            if (!registerOverlay) return;
            loginOverlay?.classList.remove("show");
            registerOverlay.classList.add("show");
            lockBodyScroll(true);
        };

        const closeAllAuth = () => {
            if (loginOverlay) loginOverlay.classList.remove("show");
            if (registerOverlay) registerOverlay.classList.remove("show");
            lockBodyScroll(false);
        };

        /* OPENERS */
        loginBtn?.addEventListener("click", openLogin);
        registerBtn?.addEventListener("click", openRegister);

        /* CLOSE (X) */
        loginClose?.addEventListener("click", closeAllAuth);
        registerClose?.addEventListener("click", closeAllAuth);

        /* CLICK JASHTË KUTISË (vetëm në overlay, jo brenda .be-auth-box) */
        loginOverlay.addEventListener("click", (e) => {
            if (e.target === loginOverlay) closeAllAuth();
        });

        registerOverlay.addEventListener("click", (e) => {
            if (e.target === registerOverlay) closeAllAuth();
        });

        /* ESC */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllAuth();
        });

        /* SWITCH LOGIN <-> REGISTER (auth-switch buttons) */
        document.querySelectorAll(".auth-switch").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.authTarget;

                if (target === "login") {
                    openLogin();
                } else if (target === "register") {
                    openRegister();
                }
            });
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

    // Inicializim kur ngarkohet header-i nga header-loader.js
    document.addEventListener("headerLoaded", () => {
        initHeaderModules();
    });

    // Në rast se header-i është tashmë në DOM (pa loader)
    if (document.querySelector(".header-desktop") || document.querySelector(".header-mobile")) {
        initHeaderModules();
    }
});
