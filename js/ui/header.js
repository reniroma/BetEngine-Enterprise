/*******************************************************
 * BetEngine – HEADER JS (FINAL ENTERPRISE VERSION)
 * Desktop + Mobile Navigation + Dropdown Engine
 *******************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /********************************************************
     * GLOBAL DROPDOWN CONTROLLER (DESKTOP)
     ********************************************************/
    const dropdowns = {
        odds: {
            toggle: document.querySelector(".odds-toggle"),
            panel: document.querySelector(".odds-dropdown"),
        },
        lang: {
            toggle: document.querySelector(".language-toggle"),
            panel: document.querySelector(".language-dropdown"),
        },
        tools: {
            toggle: document.querySelector(".sub-item-tools"),
            panel: document.querySelector(".sub-item-tools .tools-dropdown"),
        }
    };

    function closeAllDropdowns() {
        document.querySelectorAll(".show").forEach(el => el.classList.remove("show"));
    }

    // Attach desktop dropdown handlers
    Object.values(dropdowns).forEach(entry => {
        if (!entry.toggle || !entry.panel) return;

        entry.toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            entry.panel.classList.toggle("show");
        });

        // Prevent closing when clicking inside dropdown
        entry.panel.addEventListener("click", (e) => e.stopPropagation());
    });

    // Click outside closes everything
    document.addEventListener("click", () => closeAllDropdowns());


    /********************************************************
     * DESKTOP — SUBNAV SWITCHING (ODDS / COMMUNITY / ...)
     ********************************************************/
    const navItems = document.querySelectorAll(".main-nav .nav-item");
    const subgroups = document.querySelectorAll(".subnav-group");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            const target = item.dataset.section;

            subgroups.forEach(g => {
                g.classList.toggle("active", g.dataset.subnav === target);
            });
        });
    });


    /********************************************************
     * MOBILE — HAMBURGER (future slide-in menu)
     ********************************************************/
    const hamburger = document.querySelector(".hamburger");
    const mobileHeader = document.querySelector(".header-mobile");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            mobileHeader.classList.toggle("open");
        });
    }


    /********************************************************
     * MOBILE — Odds & Language (placeholder alerts)
     ********************************************************/
    const mobileOddsToggle = document.querySelector(".mobile-row .odds-toggle");
    const mobileLangToggle = document.querySelector(".mobile-row .lang-toggle");

    if (mobileOddsToggle) {
        mobileOddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Mobile odds dropdown (placeholder)");
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            alert("Mobile language dropdown (placeholder)");
        });
    }


    /********************************************************
     * MOBILE — NAV CHIPS SWITCHING
     ********************************************************/
    const chips = document.querySelectorAll(".nav-chip");
    const mobileSubnav = document.querySelectorAll(".mobile-sub-nav .subnav-group");

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            chips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            const target = chip.dataset.section;

            mobileSubnav.forEach(g => {
                g.classList.toggle("active", g.dataset.subnav === target);
            });
        });
    });


    /********************************************************
     * MOBILE — Betting Tools Dropdown (placeholder)
     ********************************************************/
    const mobileTools = document.querySelector(".sub-chip.tools");

    if (mobileTools) {
        mobileTools.addEventListener("click", () => {
            alert("Mobile betting tools dropdown (placeholder)");
        });
    }

});
