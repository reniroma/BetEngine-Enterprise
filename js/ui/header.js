/*********************************************************
 * BetEngine Enterprise – HEADER JS (FINAL v10)
 * Scope:
 *  - Desktop odds / language / tools dropdowns
 *  - Desktop main nav <-> row-sub sync
 *  - Sync odds/lang into mobile "Quick Controls" panel
 *
 * Excludes:
 *  - Mobile hamburger logic (header-mobile.js)
 *  - Mobile modal (header-modals.html)
 *  - Auth modals (header-auth.js)
 *********************************************************/

/*******************************************************
 * UTILS
 *******************************************************/
const beIsInside = (target, selector) => {
    return !!(target && target.closest(selector));
};

const beCloseAllDesktopDropdowns = () => {
    document
        .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
        .forEach(el => el.classList.remove("show"));
};

/*******************************************************
 * DESKTOP DROPDOWNS
 *******************************************************/
let beDesktopDropdownsInitialized = false;

function initDesktopDropdowns() {
    const header = document.querySelector(".header-desktop");
    if (!header) return;

    if (beDesktopDropdownsInitialized) return;
    beDesktopDropdownsInitialized = true;

    /* ---------------- ODDS ---------------- */
    const oddsToggle   = header.querySelector(".odds-format .odds-toggle");
    const oddsDropdown = header.querySelector(".odds-dropdown");
    const oddsItems    = oddsDropdown ? oddsDropdown.querySelectorAll(".item") : [];
    const oddsLabel    = header.querySelector(".odds-label");

    // Mobile "Quick Controls" mirror (inside slide menu)
    const mobileOddsQuick = document.querySelector(".menu-item.menu-odds span");

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = oddsDropdown.classList.contains("show");
            beCloseAllDesktopDropdowns();
            if (!open) oddsDropdown.classList.add("show");
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                oddsItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const clean = (item.textContent || "").split("(")[0].trim();

                if (oddsLabel) oddsLabel.textContent = clean;
                if (mobileOddsQuick) mobileOddsQuick.textContent = clean;

                oddsDropdown.classList.remove("show");
            });
        });
    }

    /* ---------------- LANGUAGE ---------------- */
    const langToggle   = header.querySelector(".language-toggle");
    const langDropdown = header.querySelector(".language-dropdown");
    const langItems    = langDropdown ? langDropdown.querySelectorAll(".item") : [];
    const langLabel    = header.querySelector(".language-selector .lang-code");

    // Mobile "Quick Controls" mirror
    const mobileLangQuick = document.querySelector(".menu-item.menu-lang span");

    if (langToggle && langDropdown) {
        langToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = langDropdown.classList.contains("show");
            beCloseAllDesktopDropdowns();
            if (!open) langDropdown.classList.add("show");
        });

        langItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                langItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const label = item.textContent || "";

                if (langLabel) langLabel.textContent = label;
                if (mobileLangQuick) mobileLangQuick.textContent = label;

                langDropdown.classList.remove("show");
            });
        });
    }

    /* ---------------- BETTING TOOLS ---------------- */
    const toolsTrigger  = header.querySelector(".sub-item-tools");
    const toolsDropdown = toolsTrigger
        ? toolsTrigger.querySelector(".tools-dropdown")
        : null;

    if (toolsTrigger && toolsDropdown) {
        toolsTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = toolsDropdown.classList.contains("show");
            beCloseAllDesktopDropdowns();
            if (!open) toolsDropdown.classList.add("show");
        });
    }

    /* ---------------- CLOSE ON OUTSIDE ---------------- */
    document.addEventListener("click", (e) => {
        if (
            !beIsInside(e.target, ".odds-format") &&
            !beIsInside(e.target, ".language-selector") &&
            !beIsInside(e.target, ".sub-item-tools") &&
            !beIsInside(e.target, ".tools-dropdown")
        ) {
            beCloseAllDesktopDropdowns();
        }
    });

    /* ---------------- CLOSE ON ESC ---------------- */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") beCloseAllDesktopDropdowns();
    });
}

/*******************************************************
 * NAVIGATION SYNC (Desktop main nav <-> row-sub)
 *******************************************************/
let beSectionNavInitialized = false;

function initSectionNavigation() {
    const dMain = document.querySelectorAll(".main-nav .nav-item");
    const dSub  = document.querySelectorAll(".row-sub .subnav-group");

    if (!dMain.length || !dSub.length) return;
    if (beSectionNavInitialized) return;
    beSectionNavInitialized = true;

    const activate = (section) => {
        if (!section) return;

        dMain.forEach(i =>
            i.classList.toggle("active", i.dataset.section === section)
        );

        dSub.forEach(g =>
            g.classList.toggle("active", g.dataset.subnav === section)
        );
    };

    // Expose for mobile menu (header-mobile.js) – safe global
    window.BE_activateSection = activate;

    // Default active (based on markup)
    const initial = Array.from(dMain).find(i => i.classList.contains("active")) || dMain[0];
    if (initial) {
        activate(initial.dataset.section);
    }

    // Desktop click handlers
    dMain.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            activate(item.dataset.section);
        });
    });
}

/*******************************************************
 * INIT ALL HEADER MODULES (DESKTOP-ONLY LOGIC)
 *******************************************************/
function initHeaderModules() {
    initDesktopDropdowns();
    initSectionNavigation();
    console.log("BetEngine Header (desktop) initialized – v10");
}

/* Run when header HTML is injected */
document.addEventListener("headerLoaded", initHeaderModules);
