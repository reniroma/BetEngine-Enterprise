/*******************************************************
 * BetEngine – HEADER FINAL JS
 * Desktop + Mobile Dropdown Logic
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
        document.querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    }

    if (oddsToggle) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            oddsDropdown.classList.toggle("show");
        });
    }

    if (langToggle) {
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

    if (toolsToggle) {
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

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            // remove active from all
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

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            mobileHeader.classList.toggle("open");
        });
    }

    /* =====================================================
       MOBILE — Odds & Language Toggle
    ===================================================== */

    const mobileOddsToggle = document.querySelector(".mobile-row .odds-toggle");
    const mobileLangToggle = document.querySelector(".mobile-row .lang-toggle");

    if (mobileOddsToggle) {
        mobileOddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Odds dropdown mobile (placeholder)");
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Language dropdown mobile (placeholder)");
        });
    }

    /* =====================================================
       MOBILE — NAV CHIPS (ODDS / COMMUNITY / BOOKMAKERS / PREMIUM)
    ===================================================== */

    const chips = document.querySelectorAll(".nav-chip");
    const mobileSubnavGroups = document.querySelectorAll(".mobile-sub-nav .subnav-group");

    chips.forEach(chip => {
        chip.addEventListener("click", () => {

            // remove active
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            const section = chip.getAttribute("data-section");

            // switch subnav
            mobileSubnavGroups.forEach(group => {
                group.classList.remove("active");
                if (group.getAttribute("data-subnav") === section) {
                    group.classList.add("active");
                }
            });
        });
    });

    /* =====================================================
       MOBILE — Betting Tools Dropdown (subnav)
    ===================================================== */

    const mobileTools = document.querySelector(".sub-chip.tools");

    if (mobileTools) {
        mobileTools.addEventListener("click", () => {
            alert("Mobile betting tools dropdown (placeholder)");
        });
    }

});
