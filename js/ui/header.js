/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL)
 * Desktop Header / Mobile Header (Modal System)
 * OddsPortal + Flashscore hybrid architecture
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
        document.body.style.overflow = lock ? "hidden" : "";
    }

    /*******************************************************
     * DESKTOP HEADER — ODDS + LANGUAGE + TOOLS DROPDOWNS
     *******************************************************/
    function initDesktopDropdowns() {
        const oddsToggle = document.querySelector(".odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");

        const langToggle = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");

        const toolsToggle = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");

        // Odds Format (desktop)
        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                oddsDropdown.classList.toggle("show");
            });

            const oddsItems = oddsDropdown.querySelectorAll(".item");
            const oddsLabel = oddsToggle.querySelector(".odds-label");

            oddsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");
                    if (oddsLabel) {
                        oddsLabel.textContent = item.textContent.replace(/\s*\(.+\)$/, "");
                    }
                    closeAllDesktopDropdowns();
                });
            });
        }

        // Language (desktop)
        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                langDropdown.classList.toggle("show");

                // match width to toggle width
                const width = langToggle.offsetWidth;
                langDropdown.style.width = width + "px";
            });

            const langItems = langDropdown.querySelectorAll(".item");
            const langCodeSpan = langToggle.querySelector(".lang-code");

            langItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const label = item.textContent.trim();
                    if (langCodeSpan) {
                        // use the text, or you can map to code if needed
                        langCodeSpan.textContent = label;
                    }

                    closeAllDesktopDropdowns();
                });
            });
        }

        // Betting Tools (Row 3 - desktop)
        if (toolsToggle && toolsDropdown) {
            toolsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                toolsDropdown.classList.toggle("show");
            });

            const toolsItems = toolsDropdown.querySelectorAll(".item");
            toolsItems.forEach(item => {
                item.addEventListener("click", (e) => {
                    e.stopPropagation();
                    // future: navigate to tool
                    closeAllDesktopDropdowns();
                });
            });
        }

        // Outside click should close dropdowns, but ignore clicks inside containers
        document.addEventListener("click", (e) => {
            const insideDropdownArea = e.target.closest(".odds-format, .language-selector, .sub-item-tools");
            if (!insideDropdownArea) {
                closeAllDesktopDropdowns();
            }
        });
    }

    /*******************************************************
     * DESKTOP NAVIGATION — Subnav Switching
     *******************************************************/
    function initDesktopSubnav() {
        const navItems = document.querySelectorAll(".main-nav .nav-item");
        const subnavGroups = document.querySelectorAll(".subnav-group");

        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();

                navItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const section = item.getAttribute("data-section");

                subnavGroups.forEach(group => {
                    group.classList.remove("active");
                    if (group.getAttribute("data-subnav") === section) {
                        group.classList.add("active");
                    }
                });
            });
        });
    }

    /*******************************************************
     * MOBILE HEADER — MODAL SYSTEM (Flashscore Style)
     *******************************************************/
    function initMobileModals() {
        const oddsBtn = document.querySelector(".mobile-odds-toggle");
        const langBtn = document.querySelector(".mobile-lang-toggle");
        const toolsBtn = document.querySelector(".mobile-tools-trigger");

        const overlay = document.querySelector("#mobile-header-modal");
        if (!overlay) return;

        const modalTitle = overlay.querySelector(".be-modal-title");
        const closeBtn = overlay.querySelector(".be-modal-close");
        const sections = overlay.querySelectorAll(".be-modal-section");

        const modalOdds = overlay.querySelector(".modal-odds");
        const modalLanguage = overlay.querySelector(".modal-language");
        const modalTools = overlay.querySelector(".modal-tools");

        const mobileOddsLabel = document.querySelector(".mobile-odds-toggle .value");
        const mobileLangLabel = document.querySelector(".mobile-lang-toggle .lang-code");

        function showOverlay() {
            overlay.classList.add("show");
            overlay.setAttribute("aria-hidden", "false");
            lockBodyScroll(true);
        }

        function hideOverlay() {
            overlay.classList.remove("show");
            overlay.setAttribute("aria-hidden", "true");
            lockBodyScroll(false);
        }

        function activateSection(sectionEl) {
            sections.forEach(sec => sec.classList.remove("active"));
            if (sectionEl) {
                sectionEl.classList.add("active");
            }
        }

        function openModal(type) {
            if (!modalTitle) return;

            if (type === "odds") {
                modalTitle.textContent = "Odds Format";
                activateSection(modalOdds);
            } else if (type === "lang") {
                modalTitle.textContent = "Select Language";
                activateSection(modalLanguage);
            } else if (type === "tools") {
                modalTitle.textContent = "Betting Tools";
                activateSection(modalTools);
            }

            showOverlay();
        }

        if (oddsBtn) {
            oddsBtn.addEventListener("click", () => openModal("odds"));
        }

        if (langBtn) {
            langBtn.addEventListener("click", () => openModal("lang"));
        }

        if (toolsBtn) {
            toolsBtn.addEventListener("click", () => openModal("tools"));
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", hideOverlay);
        }

        // Close when clicking outside the modal content
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                hideOverlay();
            }
        });

        // Odds selection in modal
        if (modalOdds) {
            const oddsItems = modalOdds.querySelectorAll(".be-modal-item");
            oddsItems.forEach(item => {
                item.addEventListener("click", () => {
                    const label = item.textContent.replace(/\s*\(.+\)$/, "").trim();
                    if (mobileOddsLabel) {
                        mobileOddsLabel.textContent = label;
                    }
                    hideOverlay();
                });
            });
        }

        // Language selection in modal
        if (modalLanguage) {
            const langItems = modalLanguage.querySelectorAll(".be-modal-item");
            langItems.forEach(item => {
                item.addEventListener("click", () => {
                    const label = item.textContent.trim();
                    if (mobileLangLabel) {
                        mobileLangLabel.textContent = label;
                    }
                    hideOverlay();
                });
            });
        }

        // Tools items in modal (close after click)
        if (modalTools) {
            const toolItems = modalTools.querySelectorAll(".be-modal-item");
            toolItems.forEach(item => {
                item.addEventListener("click", () => {
                    hideOverlay();
                });
            });
        }
    }

    /*******************************************************
     * MOBILE SUBNAV — Switching Chips
     *******************************************************/
    function initMobileSubnav() {
        const chips = document.querySelectorAll(".nav-chip");
        const subnavGroups = document.querySelectorAll(".mobile-sub-nav .subnav-group");

        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                const section = chip.getAttribute("data-section");

                subnavGroups.forEach(group => {
                    group.classList.remove("active");
                    if (group.getAttribute("data-subnav") === section) {
                        group.classList.add("active");
                    }
                });
            });
        });
    }

    /*******************************************************
     * INITIALIZE ALL MODULES
     *******************************************************/
    initDesktopDropdowns();
    initDesktopSubnav();
    initMobileModals();
    initMobileSubnav();
});
