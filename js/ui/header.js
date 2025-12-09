/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v3.0)
 * - Stable desktop dropdowns (odds, language, tools)
 * - Mobile header modal (odds / language / tools)
 * - Desktop auth modal (login / register)
 * - Compatible with existing HTML + CSS
 * - No structural changes, no layout mutations
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * CORE UTILITIES (PURE, REUSABLE)
     *******************************************************/
    const HeaderUtils = {
        closeAllDesktopDropdowns() {
            document
                .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
                .forEach(el => el.classList.remove("show"));
        },

        isInside(target, selector) {
            return target.closest(selector) !== null;
        },

        lockBodyScroll(state) {
            document.body.style.overflow = state ? "hidden" : "";
        }
    };

    /*******************************************************
     * DESKTOP DROPDOWNS (ODDS / LANGUAGE / TOOLS)
     *******************************************************/
    function initDesktopDropdowns() {
        const oddsToggle   = document.querySelector(".odds-format .odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");
        const oddsItems    = oddsDropdown?.querySelectorAll(".item") || [];
        const oddsLabel    = document.querySelector(".odds-label");

        const langToggle   = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");
        const langItems    = langDropdown?.querySelectorAll(".item") || [];
        const langLabel    = document.querySelector(".lang-code");

        const toolsTrigger  = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");
        const toolsItems    = toolsDropdown?.querySelectorAll(".item") || [];

        /* ---------------- ODDS DROPDOWN ---------------- */
        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = oddsDropdown.classList.contains("show");
                HeaderUtils.closeAllDesktopDropdowns();
                if (!open) oddsDropdown.classList.add("show");
            });

            oddsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    // Active state
                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    // Label sync (desktop + mobile)
                    const clean = item.textContent.split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    const mobileOdds = document.querySelector(".mobile-odds-toggle .value");
                    if (mobileOdds) mobileOdds.textContent = clean;

                    // Close dropdown after selection
                    oddsDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- LANGUAGE DROPDOWN ---------------- */
        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = langDropdown.classList.contains("show");
                HeaderUtils.closeAllDesktopDropdowns();
                if (!open) langDropdown.classList.add("show");
            });

            langItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();

                    // Active state
                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    // Label sync
                    const label = item.textContent;
                    const code  = item.dataset.lang?.toUpperCase() || "EN";

                    if (langLabel) langLabel.textContent = label;

                    const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = code;

                    // Close dropdown after selection
                    langDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- BETTING TOOLS DROPDOWN (PATCH B) ---------------- */
        if (toolsTrigger && toolsDropdown) {
            // Open/close on trigger click
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                HeaderUtils.closeAllDesktopDropdowns();
                if (!open) toolsDropdown.classList.add("show");
            });

            // Internal items: do NOT close dropdown automatically (per PATCH B)
            toolsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    // Logic for each tool item can be added here later.
                    // Dropdown remains open – only outside click closes it.
                });
            });
        }

        /* ---------------- CLOSE ON OUTSIDE CLICK (WHITELIST) ---------------- */
        document.addEventListener("click", (e) => {
            if (
                !HeaderUtils.isInside(e.target, ".odds-format") &&
                !HeaderUtils.isInside(e.target, ".language-selector") &&
                !HeaderUtils.isInside(e.target, ".sub-item-tools") &&
                !HeaderUtils.isInside(e.target, ".tools-dropdown")
            ) {
                HeaderUtils.closeAllDesktopDropdowns();
            }
        });

        /* ---------------- CLOSE ON ESC ---------------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                HeaderUtils.closeAllDesktopDropdowns();
            }
        });
    }

    /*******************************************************
     * DESKTOP + MOBILE SECTION NAVIGATION SYNC
     *******************************************************/
    function initSectionNavigation() {
        const desktopMainItems = document.querySelectorAll(".main-nav .nav-item");
        const desktopSubGroups = document.querySelectorAll(".row-sub .subnav-group");

        const mobileMainItems = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mobileSubGroups = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        const activateSection = (section) => {
            desktopMainItems.forEach(item =>
                item.classList.toggle("active", item.dataset.section === section)
            );
            desktopSubGroups.forEach(group =>
                group.classList.toggle("active", group.dataset.subnav === section)
            );

            mobileMainItems.forEach(item =>
                item.classList.toggle("active", item.dataset.section === section)
            );
            mobileSubGroups.forEach(group =>
                group.classList.toggle("active", group.dataset.subnav === section)
            );
        };

        desktopMainItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activateSection(item.dataset.section);
            });
        });

        mobileMainItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activateSection(item.dataset.section);
            });
        });
    }

    /*******************************************************
     * MOBILE HEADER MODAL (ODDS / LANGUAGE / TOOLS)
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

            const activeSection = modal.querySelector(`.modal-${type}`);
            if (activeSection) {
                activeSection.classList.add("active");
            }

            if (title) title.textContent = label;

            modal.classList.add("show");
            modal.dataset.current = type;
            HeaderUtils.lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            HeaderUtils.lockBodyScroll(false);
        };

        /* OPEN TRIGGERS */
        mOdds?.addEventListener("click", () => showSection("odds", "Select odds format"));
        mLang?.addEventListener("click", () => showSection("language", "Select language"));
        mTools?.addEventListener("click", () => showSection("tools", "Betting tools"));

        /* CLOSE BUTTON */
        closeBtn?.addEventListener("click", closeModal);

        /* CLICK OUTSIDE MODAL CONTENT */
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        /* ESC KEY */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });

        /* ITEM SELECTION INSIDE MODAL */
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
     * DESKTOP AUTH MODAL (LOGIN / REGISTER)
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
            HeaderUtils.lockBodyScroll(true);
        };

        const closeModal = () => {
            overlay.classList.remove("show");
            HeaderUtils.lockBodyScroll(false);
        };

        loginBtn?.addEventListener("click", () => openModal("login"));
        registerBtn?.addEventListener("click", () => openModal("register"));
        closeBtn?.addEventListener("click", closeModal);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });
    }

    /*******************************************************
     * ENTERPRISE INITIALIZER (BOUND TO headerLoaded)
     *******************************************************/
    const HeaderEnterprise = {
        init() {
            initDesktopDropdowns();
            initSectionNavigation();
            initMobileModal();
            initDesktopAuth();
        }
    };

    // IMPORTANT:
    // We ONLY init after the custom "headerLoaded" event,
    // exactly si në versionin tënd të mëparshëm. Nuk ndryshojmë
    // sjelljen bazë për të shmangur konflikte.
    document.addEventListener("headerLoaded", () => {
        HeaderEnterprise.init();
    });

});
