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
     * DESKTOP HEADER — ODDS + LANGUAGE DROPDOWNS
     *******************************************************/
    function initDesktopDropdowns() {
        const oddsToggle = document.querySelector(".odds-toggle");
        const oddsDropdown = document.querySelector(".odds-dropdown");

        const langToggle = document.querySelector(".language-toggle");
        const langDropdown = document.querySelector(".language-dropdown");

        const toolsToggle = document.querySelector(".sub-item-tools");
        const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");

        // Odds Format
        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                oddsDropdown.classList.toggle("show");
            });
        }

        // Language
        if (langToggle && langDropdown) {
            langToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                langDropdown.classList.toggle("show");

                // match width to toggle width
                const width = langToggle.offsetWidth;
                langDropdown.style.width = width + "px";
            });
        }

        // Betting Tools (Row 3)
        if (toolsToggle && toolsDropdown) {
            toolsToggle.addEventListener("click", (e) => {
                e.stopPropagation();
                closeAllDesktopDropdowns();
                toolsDropdown.classList.toggle("show");
            });
        }

        // Outside click should close dropdown
        document.addEventListener("click", () => {
            closeAllDesktopDropdowns();
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
        const oddsBtn = document.querySelector(".mobile-header-odds-btn");
        const langBtn = document.querySelector(".mobile-header-lang-btn");

        const modal = document.querySelector("#mobile-header-modal");
        const modalContent = document.querySelector("#mobile-header-modal-content");
        const modalClose = document.querySelector("#mobile-header-modal-close");

        if (!modal || !modalContent || !modalClose) return;

        function openModal(type) {
            modalContent.innerHTML = ""; // clear previous content

            if (type === "odds") {
                modalContent.innerHTML = `
                    <h2 class="modal-title">Odds Format</h2>
                    <div class="modal-item">Decimal (1.50)</div>
                    <div class="modal-item">Fractional (1/2)</div>
                    <div class="modal-item">Moneyline (-200)</div>
                    <div class="modal-item">Hong Kong (0.50)</div>
                    <div class="modal-item">Malay (0.50)</div>
                    <div class="modal-item">Indonesian (-2.00)</div>
                `;
            }

            if (type === "lang") {
                modalContent.innerHTML = `
                    <h2 class="modal-title">Select Language</h2>
                    <div class="modal-item">Arabic</div>
                    <div class="modal-item">Bulgarian</div>
                    <div class="modal-item">Chinese</div>
                    <div class="modal-item">Croatian</div>
                    <div class="modal-item">Czech</div>
                    <div class="modal-item">Danish</div>
                    <div class="modal-item">Dutch</div>
                    <div class="modal-item">English</div>
                    <div class="modal-item">Finnish</div>
                    <div class="modal-item">French</div>
                    <div class="modal-item">German</div>
                    <div class="modal-item">Greek</div>
                    <div class="modal-item">Hungarian</div>
                    <div class="modal-item">Italian</div>
                    <div class="modal-item">Korean</div>
                    <div class="modal-item">Norwegian</div>
                    <div class="modal-item">Polish</div>
                    <div class="modal-item">Portuguese</div>
                    <div class="modal-item">Romanian</div>
                    <div class="modal-item">Russian</div>
                    <div class="modal-item">Spanish</div>
                    <div class="modal-item">Swedish</div>
                    <div class="modal-item">Turkish</div>
                `;
            }

            modal.classList.add("show");
            lockBodyScroll(true);
        }

        if (oddsBtn) {
            oddsBtn.addEventListener("click", () => openModal("odds"));
        }

        if (langBtn) {
            langBtn.addEventListener("click", () => openModal("lang"));
        }

        modalClose.addEventListener("click", () => {
            modal.classList.remove("show");
            lockBodyScroll(false);
        });
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
