/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL FIX)
 * FIX for: Desktop dropdowns + Mobile dropdown modal
 * No structural changes. Compatible with current HTML.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * UTILITY FUNCTIONS
     *******************************************************/
    const closeAllDesktopDropdowns = () => {
        document.querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    };

    const isInside = (target, selector) => target.closest(selector) !== null;

    const lockBodyScroll = (state) => {
        document.body.style.overflow = state ? "hidden" : "";
    };

    /*******************************************************
     * DESKTOP: ODDS + LANGUAGE + TOOLS
     *******************************************************/
    function initDesktopDropdowns() {
        const oddsToggle = document.querySelector(".odds-format .odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");
        const oddsItems = oddsDropdown?.querySelectorAll(".item") || [];
        const oddsLabel = document.querySelector(".odds-label");

        const langToggle = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");
        const langItems = langDropdown?.querySelectorAll(".item") || [];
        const langLabel = document.querySelector(".lang-code");

        const toolsTrigger = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");

        /* ---------------- ODDS ---------------- */
        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = oddsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) oddsDropdown.classList.add("show");
            });

            oddsItems.forEach(item => {
                item.addEventListener("click", () => {
                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const text = item.textContent;
                    const clean = text.split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    // Sync to mobile
                    const mobileOdds = document.querySelector(".mobile-odds-toggle .value");
                    if (mobileOdds) mobileOdds.textContent = clean;

                    oddsDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- LANGUAGE ---------------- */
        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = langDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) langDropdown.classList.add("show");
            });

            langItems.forEach(item => {
                item.addEventListener("click", () => {
                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const label = item.textContent;
                    const code = item.dataset.lang?.toUpperCase() || "EN";

                    if (langLabel) langLabel.textContent = label;

                    // Sync to mobile
                    const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = code;

                    langDropdown.classList.remove("show");
                });
            });
        }

        /* ---------------- BETTING TOOLS ---------------- */
        if (toolsTrigger && toolsDropdown) {
            toolsTrigger.addEventListener("click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!open) toolsDropdown.classList.add("show");
            });
        }

        /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
        document.addEventListener("click", (e) => {
            if (
                !isInside(e.target, ".odds-format") &&
                !isInside(e.target, ".language-selector") &&
                !isInside(e.target, ".sub-item-tools")
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
     * DESKTOP + MOBILE NAVIGATION SYNC
     *******************************************************/
    function initSectionNavigation() {
        const dMain = document.querySelectorAll(".main-nav .nav-item");
        const dSub = document.querySelectorAll(".row-sub .subnav-group");

        const mMain = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const mSub = document.querySelectorAll(".mobile-sub-nav .subnav-group");

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
     * MOBILE: MODAL (ODDS / LANGUAGE / TOOLS)
     *******************************************************/
    function initMobileModal() {
        const modal = document.getElementById("mobile-header-modal");
        if (!modal) return;

        const title = modal.querySelector(".be-modal-title");
        const sections = modal.querySelectorAll(".be-modal-section");
        const closeBtn = modal.querySelector(".be-modal-close");

        const mOdds = document.querySelector(".mobile-odds-toggle");
        const mLang = document.querySelector(".mobile-lang-toggle");
        const mTools = document.querySelector(".mobile-tools-trigger");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            modal.querySelector(`.modal-${type}`).classList.add("active");
            title.textContent = label;
            modal.classList.add("show");
            modal.dataset.current = type;
            lockBodyScroll(true);
        };

        const closeModal = () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        };

        /* ---------------- OPEN TRIGGERS ---------------- */
        mOdds?.addEventListener("click", () => showSection("odds", "Select odds format"));
        mLang?.addEventListener("click", () => showSection("language", "Select language"));
        mTools?.addEventListener("click", () => showSection("tools", "Betting tools"));

        /* ---------------- CLOSE BUTTON ---------------- */
        closeBtn?.addEventListener("click", closeModal);

        /* ---------------- OUTSIDE CLICK ---------------- */
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        /* ---------------- ESC KEY ---------------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeModal();
        });

        /* ---------------- ITEM SELECTION ---------------- */
        sections.forEach(section => {
            section.querySelectorAll(".be-modal-item").forEach(item => {
                item.addEventListener("click", () => {
                    const type = modal.dataset.current;

                    if (type === "odds") {
                        const clean = item.textContent.split("(")[0].trim();
                        const desktopLabel = document.querySelector(".odds-label");
                        const mobileLabel = document.querySelector(".mobile-odds-toggle .value");
                        if (desktopLabel) desktopLabel.textContent = clean;
                        if (mobileLabel) mobileLabel.textContent = clean;
                    }

                    if (type === "language") {
                        const txt = item.textContent;
                        const code = item.dataset.lang.toUpperCase();
                        const desktopLang = document.querySelector(".language-toggle .lang-code");
                        const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                        if (desktopLang) desktopLang.textContent = txt;
                        if (mobileLang) mobileLang.textContent = code;
                    }

                    closeModal();
                });
            });
        });
    }

    /*******************************************************
     * DESKTOP AUTH MODAL (LOGIN / REGISTER)
     * NEW PATCH — ADDED SAFELY
     *******************************************************/
    function initDesktopAuth() {
        const overlay = document.querySelector(".be-auth-overlay");
        if (!overlay) return;

        const loginBtn = document.querySelector(".btn-auth.login");
        const registerBtn = document.querySelector(".btn-auth.register");
        const closeBtn = overlay.querySelector(".auth-close");

        const title = overlay.querySelector(".auth-header span");

        const openModal = (type) => {
            title.textContent = type === "login" ? "Login" : "Register";
            overlay.classList.add("show");
            lockBodyScroll(true);
        };

        const closeModal = () => {
            overlay.classList.remove("show");
            lockBodyScroll(false);
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
     * INIT ALL MODULES
     *******************************************************/
    initDesktopDropdowns();
    initSectionNavigation();
    initMobileModal();
    initDesktopAuth();  // NEW PATCH

});
