/*******************************************************
 * BetEngine – HEADER FINAL JS
 * Desktop + Mobile Dropdown & Modal Logic
 *******************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DESKTOP DROPDOWNS — Odds & Language
    ===================================================== */

    const oddsToggle = document.querySelector(".odds-toggle");
    const oddsDropdown = document.querySelector(".odds-dropdown");

    const langToggle = document.querySelector(".language-toggle");
    const langDropdown = document.querySelector(".language-dropdown");

    function closeAllDropdowns() {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach((el) => el.classList.remove("show"));
    }

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            oddsDropdown.classList.toggle("show");
        });
    }

    if (langToggle && langDropdown) {
        langToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            langDropdown.classList.toggle("show");
        });
    }

    /* =====================================================
       DESKTOP — Betting Tools Dropdown (Row 3)
    ===================================================== */

    const toolsToggle = document.querySelector(".sub-item-tools");
    const toolsDropdown = toolsToggle
        ? toolsToggle.querySelector(".tools-dropdown")
        : null;

    if (toolsToggle && toolsDropdown) {
        toolsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            toolsDropdown.classList.toggle("show");
        });
    }

    /* Close dropdowns when clicking outside */
    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

    /* =====================================================
       SUBNAV SWITCHING — Desktop
       (odds / community / bookmakers / premium)
    ===================================================== */

    const navItems = document.querySelectorAll(".main-nav .nav-item");
    const subnavGroups = document.querySelectorAll(".subnav-group");

    navItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            navItems.forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            const section = item.getAttribute("data-section");

            subnavGroups.forEach((group) => {
                group.classList.remove("active");
                if (group.getAttribute("data-subnav") === section) {
                    group.classList.add("active");
                }
            });
        });
    });

    /* =====================================================
       MOBILE — Hamburger Menu Toggle
    ===================================================== */

    const hamburger = document.querySelector(".hamburger");
    const mobileHeader = document.querySelector(".header-mobile");

    if (hamburger && mobileHeader) {
        hamburger.addEventListener("click", () => {
            mobileHeader.classList.toggle("open");
        });
    }

    /* =====================================================
       MOBILE MODALS — Core Helpers
    ===================================================== */

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        const anyOpen = document.querySelector(".mobile-modal.active");
        if (!anyOpen) {
            document.body.classList.remove("modal-open");
        }
    }

    function wireModal(modal) {
        if (!modal) return;

        const overlay = modal.querySelector(".modal-overlay");
        const closeButtons = modal.querySelectorAll(".modal-close");

        if (overlay) {
            overlay.addEventListener("click", () => {
                closeModal(modal);
            });
        }

        closeButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                closeModal(modal);
            });
        });

        // Simple swipe-down gesture on the panel
        const panel = modal.querySelector(".modal-panel");
        if (panel) {
            let startY = 0;
            let currentY = 0;
            let isDragging = false;

            panel.addEventListener("touchstart", (e) => {
                if (!e.touches || !e.touches[0]) return;
                startY = e.touches[0].clientY;
                currentY = startY;
                isDragging = true;
            });

            panel.addEventListener("touchmove", (e) => {
                if (!isDragging || !e.touches || !e.touches[0]) return;
                currentY = e.touches[0].clientY;
            });

            panel.addEventListener("touchend", () => {
                if (!isDragging) return;
                const delta = currentY - startY;
                if (delta > 60) {
                    closeModal(modal);
                }
                isDragging = false;
            });
        }
    }

    const modalOdds = document.getElementById("modal-odds");
    const modalLanguage = document.getElementById("modal-language");

    wireModal(modalOdds);
    wireModal(modalLanguage);

    /* =====================================================
       MOBILE — Odds & Language Toggle → Open Modal
    ===================================================== */

    const mobileOddsToggle = document.querySelector(
        ".header-mobile .row-top .odds-toggle"
    );
    const mobileLangToggle = document.querySelector(
        ".header-mobile .row-top .lang-toggle"
    );

    if (mobileOddsToggle) {
        mobileOddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("modal-odds");
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("modal-language");
        });
    }

    /* =====================================================
       MOBILE — NAV CHIPS (ODDS / COMMUNITY / BOOKMAKERS / PREMIUM)
    ===================================================== */

    const chips = document.querySelectorAll(".nav-chip");
    const mobileSubnavGroups = document.querySelectorAll(
        ".mobile-sub-nav .subnav-group"
    );

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            chips.forEach((c) => c.classList.remove("active"));
            chip.classList.add("active");

            const section = chip.getAttribute("data-section");

            mobileSubnavGroups.forEach((group) => {
                group.classList.remove("active");
                if (group.getAttribute("data-subnav") === section) {
                    group.classList.add("active");
                }
            });
        });
    });

    /* =====================================================
       MOBILE — Betting Tools Dropdown (subnav)
       (placeholder behavior for now)
    ===================================================== */

    const mobileTools = document.querySelector(".sub-chip.tools");

    if (mobileTools) {
        mobileTools.addEventListener("click", () => {
            // Placeholder: later will be replaced with real tools menu
            alert("Mobile betting tools (coming soon)");
        });
    }

    /* =====================================================
       MOBILE — LANGUAGE LIST POPULATION (23 languages)
    ===================================================== */

    const languageList = [
        "English",
        "German",
        "Dutch",
        "French",
        "Italian",
        "Spanish",
        "Portuguese",
        "Danish",
        "Swedish",
        "Norwegian",
        "Finnish",
        "Polish",
        "Czech",
        "Slovak",
        "Hungarian",
        "Romanian",
        "Greek",
        "Turkish",
        "Croatian",
        "Serbian",
        "Bulgarian",
        "Russian",
        "Ukrainian"
    ];

    const languageModalContent = document.getElementById(
        "language-modal-content"
    );
    const mobileLangCode = document.querySelector(
        ".header-mobile .lang-code"
    );
    const desktopLangCode = document.querySelector(
        ".language-toggle .lang-code"
    );

    if (languageModalContent && languageList.length > 0) {
        languageList.forEach((lang) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "modal-item";
            btn.textContent = lang;
            btn.dataset.lang = lang;
            btn.addEventListener("click", () => {
                if (mobileLangCode) {
                    mobileLangCode.textContent = lang === "English" ? "EN" : lang.slice(0, 2).toUpperCase();
                }
                if (desktopLangCode) {
                    desktopLangCode.textContent = lang;
                }
                closeModal(modalLanguage);
            });
            languageModalContent.appendChild(btn);
        });
    }

});
