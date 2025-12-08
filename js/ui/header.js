/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL)
 * Desktop Header + Mobile Header + Modal System
 * OddsPortal-style architecture
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * UTILITY FUNCTIONS
     *******************************************************/
    function closeAllDesktopDropdowns() {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    }

    function lockBodyScroll(lock) {
        document.body.classList.toggle("be-modal-open", lock);
    }

    /*******************************************************
     * DESKTOP HEADER — ODDS + LANGUAGE DROPDOWNS
     *******************************************************/
    function initDesktopDropdowns() {
        const oddsToggle = document.querySelector(".odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");

        const langToggle = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");

        const toolsToggle = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".tools-dropdown");

        if (oddsToggle) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                oddsDropdown.classList.toggle("show");
            });
        }

        if (langToggle) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                langDropdown.classList.toggle("show");
            });
        }

        if (toolsToggle) {
            toolsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                toolsDropdown.classList.toggle("show");
            });
        }

        document.addEventListener("click", () => {
            closeAllDesktopDropdowns();
        });
    }

    /*******************************************************
     * DESKTOP — SUBNAV SWITCHING
     *******************************************************/
    function initDesktopSubnav() {
        const navItems = document.querySelectorAll(".main-nav .nav-item");
        const subnavGroups = document.querySelectorAll(".subnav-group");

        navItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.preventDefault();

                const section = item.dataset.section;

                navItems.forEach(n => n.classList.remove("active"));
                item.classList.add("active");

                subnavGroups.forEach(g => {
                    if (g.dataset.subnav === section) {
                        g.classList.add("active");
                    } else {
                        g.classList.remove("active");
                    }
                });
            });
        });
    }

    /*******************************************************
     * MOBILE HEADER — NAV CHIPS + SUBNAV SWITCHING
     *******************************************************/
    function initMobileNav() {
        const chips = document.querySelectorAll(".mobile-main-nav .nav-chip");
        const groups = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                const section = chip.dataset.section;

                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                groups.forEach(g => {
                    if (g.dataset.subnav === section) {
                        g.classList.add("active");
                    } else {
                        g.classList.remove("active");
                    }
                });
            });
        });
    }

    /*******************************************************
     * MOBILE HEADER — MODAL SYSTEM (Odds, Language, Tools)
     *******************************************************/
    function initMobileModal() {
        const modal = document.getElementById("mobile-header-modal");
        const modalClose = modal.querySelector(".be-modal-close");

        const oddsBtn = document.querySelector(".mobile-odds-toggle");
        const langBtn = document.querySelector(".mobile-lang-toggle");
        const toolsBtn = document.querySelector(".mobile-tools-trigger");

        const oddsPanel = modal.querySelector(".modal-odds");
        const langPanel = modal.querySelector(".modal-language");
        const toolsPanel = modal.querySelector(".modal-tools");

        function openModal(panel) {
            modal.querySelectorAll(".be-modal-section").forEach(s => s.classList.remove("active"));
            panel.classList.add("active");

            modal.classList.add("open");
            lockBodyScroll(true);
        }

        function closeModal() {
            modal.classList.remove("open");
            lockBodyScroll(false);
        }

        if (oddsBtn) {
            oddsBtn.addEventListener("click", () => openModal(oddsPanel));
        }

        if (langBtn) {
            langBtn.addEventListener("click", () => openModal(langPanel));
        }

        if (toolsBtn) {
            toolsBtn.addEventListener("click", () => openModal(toolsPanel));
        }

        modalClose.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    /*******************************************************
     * MOBILE — UPDATE SELECTED VALUES (Odds & Language)
     *******************************************************/
    function initMobileSelection() {
        document.querySelectorAll(".modal-odds .be-modal-item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelector(".mobile-odds-toggle .value").textContent =
                    item.textContent.replace(/\(.*?\)/, "").trim();
                document.getElementById("mobile-header-modal").classList.remove("open");
                lockBodyScroll(false);
            });
        });

        document.querySelectorAll(".modal-language .be-modal-item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelector(".mobile-lang-toggle .lang-code").textContent =
                    item.dataset.lang.toUpperCase();
                document.getElementById("mobile-header-modal").classList.remove("open");
                lockBodyScroll(false);
            });
        });
    }

    /*******************************************************
     * DESKTOP — UPDATE SELECTED VALUES (Odds & Language)
     *******************************************************/
    function initDesktopSelection() {
        document.querySelectorAll(".odds-dropdown .item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelector(".odds-label").textContent =
                    item.textContent.replace(/\(.*?\)/, "").trim();
                closeAllDesktopDropdowns();
            });
        });

        document.querySelectorAll(".language-dropdown .item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelector(".language-toggle .lang-code").textContent =
                    item.dataset.lang === "en"
                        ? "English"
                        : item.textContent;
                closeAllDesktopDropdowns();
            });
        });
    }

    /*******************************************************
     * INITIALIZATION
     *******************************************************/
    initDesktopDropdowns();
    initDesktopSubnav();
    initDesktopSelection();

    initMobileNav();
    initMobileModal();
    initMobileSelection();
});
