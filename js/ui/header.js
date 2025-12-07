// js/ui/header.js
// BetEngine Enterprise - Header logic (desktop + mobile)

document.addEventListener("DOMContentLoaded", function () {
    /* ============================================
       ELEMENT REFERENCES
    ============================================ */

    // Desktop header
    const desktopHeader = document.querySelector(".header-desktop");
    const mainNav = desktopHeader ? desktopHeader.querySelector(".main-nav") : null;
    const desktopNavItems = mainNav ? mainNav.querySelectorAll(".nav-item[data-section]") : [];
    const desktopSubnavGroups = desktopHeader ? desktopHeader.querySelectorAll(".row-sub .subnav-group") : [];

    const oddsToggle = desktopHeader ? desktopHeader.querySelector(".odds-toggle") : null;
    const oddsDropdown = desktopHeader ? desktopHeader.querySelector(".odds-dropdown") : null;

    const languageToggle = desktopHeader ? desktopHeader.querySelector(".language-toggle") : null;
    const languageDropdown = desktopHeader ? desktopHeader.querySelector(".language-dropdown") : null;

    const toolsToggle = desktopHeader ? desktopHeader.querySelector(".sub-item-tools") : null;
    const toolsDropdown = toolsToggle ? toolsToggle.querySelector(".tools-dropdown") : null;

    // Mobile header
    const mobileHeader = document.querySelector(".header-mobile");
    const mobileNavChips = mobileHeader ? mobileHeader.querySelectorAll(".nav-chip[data-section]") : [];
    const mobileSubnavGroups = mobileHeader ? mobileHeader.querySelectorAll(".mobile-sub-nav .subnav-group") : [];
    const hamburgerButton = mobileHeader ? mobileHeader.querySelector(".hamburger") : null;

    /* ============================================
       DROPDOWN STATE
    ============================================ */

    let oddsOpen = false;
    let languageOpen = false;
    let toolsOpen = false;

    function closeOdds() {
        if (oddsDropdown) {
            oddsDropdown.style.display = "none";
        }
        oddsOpen = false;
    }

    function openOdds() {
        if (oddsDropdown) {
            oddsDropdown.style.display = "block";
        }
        oddsOpen = true;
    }

    function closeLanguage() {
        if (languageDropdown) {
            languageDropdown.style.display = "none";
        }
        languageOpen = false;
    }

    function openLanguage() {
        if (languageDropdown) {
            languageDropdown.style.display = "block";
        }
        languageOpen = true;
    }

    function closeTools() {
        if (toolsDropdown) {
            toolsDropdown.style.display = "none";
        }
        toolsOpen = false;
    }

    function openTools() {
        if (toolsDropdown) {
            toolsDropdown.style.display = "block";
        }
        toolsOpen = true;
    }

    function closeAll(except) {
        if (except !== "odds") closeOdds();
        if (except !== "lang") closeLanguage();
        if (except !== "tools") closeTools();
    }

    /* ============================================
       DESKTOP NAVIGATION
    ============================================ */

    function setDesktopSection(section) {
        if (!desktopSubnavGroups.length) return;

        desktopNavItems.forEach(function (item) {
            const s = item.getAttribute("data-section");
            if (s === section) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        desktopSubnavGroups.forEach(function (group) {
            const groupSection = group.getAttribute("data-subnav");
            if (groupSection === section) {
                group.classList.add("active");
            } else {
                group.classList.remove("active");
            }
        });
    }

    function initDesktopNav() {
        if (!desktopHeader || !desktopNavItems.length) return;

        // Default section
        var defaultSection = "odds";
        desktopNavItems.forEach(function (item) {
            if (item.classList.contains("active")) {
                defaultSection = item.getAttribute("data-section") || defaultSection;
            }
        });

        setDesktopSection(defaultSection);

        desktopNavItems.forEach(function (item) {
            item.addEventListener("click", function (event) {
                event.preventDefault();
                const section = item.getAttribute("data-section");
                if (!section) return;
                setDesktopSection(section);
            });
        });
    }

    /* ============================================
       DESKTOP DROPDOWNS
    ============================================ */

    function initDesktopDropdowns() {
        // Odds
        if (oddsToggle && oddsDropdown) {
            oddsToggle.addEventListener("click", function (event) {
                event.stopPropagation();
                if (oddsOpen) {
                    closeOdds();
                } else {
                    closeAll("odds");
                    openOdds();
                }
            });
        }

        // Language
        if (languageToggle && languageDropdown) {
            languageToggle.addEventListener("click", function (event) {
                event.stopPropagation();
                if (languageOpen) {
                    closeLanguage();
                } else {
                    closeAll("lang");
                    openLanguage();
                }
            });
        }

        // Betting tools
        if (toolsToggle && toolsDropdown) {
            toolsToggle.addEventListener("click", function (event) {
                event.stopPropagation();
                if (toolsOpen) {
                    closeTools();
                } else {
                    closeAll("tools");
                    openTools();
                }
            });
        }
    }

    /* ============================================
       MOBILE NAVIGATION
    ============================================ */

    function setMobileSection(section) {
        if (!mobileHeader) return;

        mobileNavChips.forEach(function (chip) {
            const s = chip.getAttribute("data-section");
            if (s === section) {
                chip.classList.add("active");
            } else {
                chip.classList.remove("active");
            }
        });

        mobileSubnavGroups.forEach(function (group) {
            const g = group.getAttribute("data-subnav");
            if (g === section) {
                group.classList.add("active");
            } else {
                group.classList.remove("active");
            }
        });
    }

    function initMobileNav() {
        if (!mobileHeader) return;

        // Default mobile section
        var defaultSection = "odds";
        mobileNavChips.forEach(function (chip) {
            if (chip.classList.contains("active")) {
                defaultSection = chip.getAttribute("data-section") || defaultSection;
            }
        });
        setMobileSection(defaultSection);

        mobileNavChips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                const section = chip.getAttribute("data-section");
                if (!section) return;
                setMobileSection(section);
            });
        });

        // Hamburger basic toggle (class only, ready for future menu)
        if (hamburgerButton) {
            hamburgerButton.addEventListener("click", function () {
                mobileHeader.classList.toggle("is-open");
            });
        }
    }

    /* ============================================
       GLOBAL LISTENERS
    ============================================ */

    // Click outside → close dropdowns
    document.addEventListener("click", function (event) {
        const target = event.target;

        // Odds
        if (oddsDropdown && oddsToggle) {
            if (!oddsDropdown.contains(target) && !oddsToggle.contains(target)) {
                closeOdds();
            }
        }

        // Language
        if (languageDropdown && languageToggle) {
            if (!languageDropdown.contains(target) && !languageToggle.contains(target)) {
                closeLanguage();
            }
        }

        // Tools
        if (toolsDropdown && toolsToggle) {
            if (!toolsDropdown.contains(target) && !toolsToggle.contains(target)) {
                closeTools();
            }
        }
    });

    // ESC key → close all
    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeAll();
        }
    });

    /* ============================================
       INIT
    ============================================ */

    initDesktopNav();
    initDesktopDropdowns();
    initMobileNav();
});
