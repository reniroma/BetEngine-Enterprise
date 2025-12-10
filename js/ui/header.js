/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v5 FINAL)
 * Unified Auth Modal + Desktop/Mobile Integration
 * Removes legacy .be-auth-overlay system entirely
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * HELPERS
     *******************************************************/
    const lockBodyScroll = (state) => {
        document.body.style.overflow = state ? "hidden" : "";
    };

    const isInside = (target, selector) => {
        return !!(target && target.closest(selector));
    };

    const closeAllDesktopDropdowns = () => {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    };

    /*******************************************************
     * DESKTOP DROPDOWNS (SAME AS BEFORE)
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

                    if (langLabel) langLabel.textContent = item.textContent;

                    const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = (item.dataset.lang || "en").toUpperCase();

                    langDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- BETTING TOOLS ---------------- */
        const toolsTrigger  = header.querySelector(".sub-item-tools");
        const toolsDropdown = toolsTrigger ? toolsTrigger.querySelector(".tools-dropdown") : null;

        if (toolsTrigger && toolsDropdown) {
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) toolsDropdown.classList.add("show");
            });
        }

        /* ---------------- CLOSERS ---------------- */
        document.addEventListener("click", (e) => {
            if (
                !isInside(e.target, ".odds-format") &&
                !isInside(e.target, ".language-selector") &&
                !isInside(e.target, ".sub-item-tools")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllDesktopDropdowns();
        });
    }

    /*******************************************************
     * SECTION NAVIGATION SYNC
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub  = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub  = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        const activate = (section) => {
            dMain.forEach(i => i.classList.toggle("active", i.dataset.section === section));
            dSub.forEach(g => g.classList.toggle("active", g.dataset.subnav === section));

            mMain.forEach(i => i.classList.toggle("active", i.dataset.section === section));
            mSub.forEach(g => g.classList.toggle("active", g.dataset.subnav === section));
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
     * MOBILE MODAL (ODDS / LANGUAGE / TOOLS)
     *******************************************************/
    function initMobileModal() {
        const modal = document.getElementById("mobile-header-modal");
        if (!modal) return;

        const title    = modal.querySelector(".be-modal-title");
        const sections = modal.querySelectorAll(".be-modal-section");
        const closeBtn = modal.querySelector(".be-modal-close");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            const active = modal.querySelector(`.modal-${type}`);
            if (active) active.classList.add("active");

            if (title) title.textContent = label;

            modal.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        document.querySelector(".mobile-odds-toggle")?.addEventListener("click", () => {
            showSection("odds", "Select odds format");
        });

        document.querySelector(".mobile-lang-toggle")?.addEventListener("click", () => {
            showSection("language", "Select language");
        });

        document.querySelector(".mobile-tools-trigger")?.addEventListener("click", () => {
            showSection("tools", "Betting tools");
        });

        closeBtn?.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
        });
    }

    /*******************************************************
     * AUTH MODAL (UNIFIED LOGIN + REGISTER)
     *******************************************************/
    function initUnifiedAuthModal() {
        const modal     = document.getElementById("auth-modal");
        if (!modal) return;

        const closeBtn  = modal.querySelector("[data-auth-close]");
        const title     = modal.querySelector(".auth-header-title");

        const loginForm    = modal.querySelector("#auth-login-form");
        const registerForm = modal.querySelector("#auth-register-form");

        const socialLoginText  = modal.querySelectorAll("#auth-social-text-login, #auth-social-text2-login, #auth-social-text3-login");
        const socialRegisterText = modal.querySelectorAll("#auth-social-text-register, #auth-social-text2-register, #auth-social-text3-register");

        /* Unified open method */
        const openAuth = (type) => {
            if (type === "login") {
                title.textContent = "Login";
                loginForm.style.display = "";
                registerForm.style.display = "none";

                socialLoginText.forEach(el => el.style.display = "inline");
                socialRegisterText.forEach(el => el.style.display = "none");
            } else {
                title.textContent = "Create account";
                loginForm.style.display = "none";
                registerForm.style.display = "";

                socialLoginText.forEach(el => el.style.display = "none");
                socialRegisterText.forEach(el => el.style.display = "inline");
            }

            modal.classList.add("show");
            lockBodyScroll(true);
        };

        /* Unified close method */
        const closeAuth = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        /* CLOSE HANDLERS */
        closeBtn?.addEventListener("click", closeAuth);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeAuth();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) closeAuth();
        });

        /* SWITCH BETWEEN LOGIN / REGISTER */
        modal.querySelectorAll(".auth-switch").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.authTarget;
                openAuth(target);
            });
        });

        /* GLOBAL TRIGGERS (desktop + mobile) */
        document.querySelectorAll(".btn-auth.login").forEach(btn => {
            btn.addEventListener("click", () => openAuth("login"));
        });

        document.querySelectorAll(".btn-auth.register").forEach(btn => {
            btn.addEventListener("click", () => openAuth("register"));
        });

        /* Make openAuth public for future modules */
        window.openAuth = openAuth;
        window.closeAuth = closeAuth;
    }

    /*******************************************************
     * INIT ALL MODULES
     *******************************************************/
    const initHeaderModules = () => {
        initDesktopDropdowns();
        initSectionNavigation();
        initMobileModal();
        initUnifiedAuthModal();
    };

    document.addEventListener("headerLoaded", initHeaderModules);

    if (document.querySelector(".header-desktop") || document.querySelector(".header-mobile")) {
        setTimeout(initHeaderModules, 0);
    }
});
