/*******************************************************
 * BetEngine – HEADER FINAL JS (Enterprise Build)
 * Desktop + Mobile Dropdown Logic
 *******************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       UTIL — Close all dropdowns
    ===================================================== */
    function closeAllDropdowns() {
        document.querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    }

    /* =====================================================
       DESKTOP — Odds & Language Dropdowns
    ===================================================== */
    const oddsToggle = document.querySelector(".odds-toggle");
    const oddsDropdown = document.querySelector(".odds-dropdown");

    const langToggle = document.querySelector(".language-toggle");
    const langDropdown = document.querySelector(".language-dropdown");

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
    const toolsDropdown = document.querySelector(".sub-item-tools .tools-dropdown");

    if (toolsToggle && toolsDropdown) {
        toolsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            toolsDropdown.classList.toggle("show");
        });
    }

    /* =====================================================
       CLICK OUTSIDE TO CLOSE
    ===================================================== */
    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

    /* =====================================================
       SUBNAV SWITCHING — Desktop
    ===================================================== */
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
       MOBILE — Odds & Language Toggles (placeholder)
    ===================================================== */
    const mobileOddsToggle = document.querySelector(".mobile-row .odds-toggle");
    const mobileLangToggle = document.querySelector(".mobile-row .lang-toggle");

    if (mobileOddsToggle) {
        mobileOddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Odds dropdown (mobile version coming soon)");
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Language dropdown (mobile version coming soon)");
        });
    }

    /* =====================================================
       MOBILE — Navigation Chips
    ===================================================== */
    const chips = document.querySelectorAll(".nav-chip");
    const mobileSubnavGroups = document.querySelectorAll(".mobile-sub-nav .subnav-group");

    chips.forEach(chip => {
        chip.addEventListener("click", () => {

            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            const section = chip.getAttribute("data-section");

            mobileSubnavGroups.forEach(group => {
                group.classList.remove("active");
                if (group.getAttribute("data-subnav") === section) {
                    group.classList.add("active");
                }
            });
        });
    });

    /* =====================================================
       MOBILE — Betting Tools Placeholder
    ===================================================== */
    const mobileTools = document.querySelector(".sub-chip.tools");

    if (mobileTools) {
        mobileTools.addEventListener("click", () => {
            alert("Mobile Betting Tools menu coming soon");
        });
    }

    /* =====================================================
       FIX — Prevent closing dropdown on scroll
    ===================================================== */
    let isDropdownOpen = false;

    [oddsDropdown, langDropdown, toolsDropdown].forEach(drop => {
        if (!drop) return;

        drop.addEventListener("mouseenter", () => {
            isDropdownOpen = true;
        });

        drop.addEventListener("mouseleave", () => {
            isDropdownOpen = false;
        });
    });

    window.addEventListener("scroll", () => {
        if (!isDropdownOpen) {
            closeAllDropdowns();
        }
    });

});
