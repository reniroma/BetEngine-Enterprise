/*********************************************************
 * BetEngine Enterprise – HEADER.JS (FINAL v10)
 * Fokus: vetëm DESKTOP header
 * - Odds / Language / Tools dropdowns
 * - Section navigation (desktop main + subnav)
 * - Zero logjikë për mobile menu / mobile modal
 * - Zero logjikë për auth (auth është në header-auth.js)
 *********************************************************/

/*******************************************************
 * UTILS
 *******************************************************/
const BE_isInside = (target, selector) => {
    return !!(target && target.closest(selector));
};

const BE_closeAllDesktopDropdowns = () => {
    document
        .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
        .forEach(el => el.classList.remove("show"));
};

/*******************************************************
 * DESKTOP DROPDOWNS
 *******************************************************/
function initDesktopDropdowns() {
    const header = document.querySelector(".header-desktop");
    if (!header) return;

    /* ---------------- ODDS ---------------- */
    const oddsToggle   = header.querySelector(".odds-format .odds-toggle");
    const oddsDropdown = header.querySelector(".odds-dropdown");
    const oddsItems    = oddsDropdown ? oddsDropdown.querySelectorAll(".item") : [];
    const oddsLabel    = header.querySelector(".odds-label");

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = oddsDropdown.classList.contains("show");
            BE_closeAllDesktopDropdowns();
            if (!open) oddsDropdown.classList.add("show");
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                oddsItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const clean = item.textContent.split("(")[0].trim();
                if (oddsLabel) oddsLabel.textContent = clean;

                // Optional sync me mobile (nëse ekziston markup-i i vjetër)
                const mobileOdds = document.querySelector(".mobile-odds-toggle .value");
                if (mobileOdds) mobileOdds.textContent = clean;

                oddsDropdown.classList.remove("show");
            });
        });
    }

    /* ---------------- LANGUAGE ---------------- */
    const langToggle   = header.querySelector(".language-toggle");
    const langDropdown = header.querySelector(".language-dropdown");
    const langItems    = langDropdown ? langDropdown.querySelectorAll(".item") : [];
    const langLabel    = header.querySelector(".language-selector .lang-code");

    if (langToggle && langDropdown) {
        langToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = langDropdown.classList.contains("show");
            BE_closeAllDesktopDropdowns();
            if (!open) langDropdown.classList.add("show");
        });

        langItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                langItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const label = item.textContent || "";
                const code  = (item.dataset.lang || "EN").toUpperCase();

                if (langLabel) langLabel.textContent = label;

                // Optional sync me mobile (nëse ekziston markup-i i vjetër)
                const mobileLang = document.querySelector(".mobile-lang-toggle .lang-code");
                if (mobileLang) mobileLang.textContent = code;

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
            BE_closeAllDesktopDropdowns();
            if (!open) toolsDropdown.classList.add("show");
        });
    }

    /* ---------------- CLOSE ON OUTSIDE (DESKTOP VETËM) ---------------- */
    document.addEventListener("click", (e) => {
        if (
            !BE_isInside(e.target, ".odds-format") &&
            !BE_isInside(e.target, ".language-selector") &&
            !BE_isInside(e.target, ".sub-item-tools") &&
            !BE_isInside(e.target, ".tools-dropdown")
        ) {
            BE_closeAllDesktopDropdowns();
        }
    });

    /* ---------------- CLOSE ON ESC ---------------- */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") BE_closeAllDesktopDropdowns();
    });
}

/*******************************************************
 * NAVIGATION SYNC (Desktop Only + hook për mobile menu)
 *******************************************************/
function initSectionNavigation() {
    const dMain = document.querySelectorAll(".main-nav .nav-item");
    const dSub  = document.querySelectorAll(".row-sub .subnav-group");

    const activate = (section) => {
        if (!section) return;

        dMain.forEach(i =>
            i.classList.toggle("active", i.dataset.section === section)
        );

        dSub.forEach(g =>
            g.classList.toggle("active", g.dataset.subnav === section)
        );
    };

    // Ekspozuar për mobile menu (menu-link data-section)
    window.BE_activateSection = activate;

    dMain.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            activate(item.dataset.section);
        });
    });
}

/*******************************************************
 * INIT ALL HEADER MODULES (DESKTOP ONLY)
 *******************************************************/
function initHeaderModules() {
    if (window.__BE_HEADER_INITED__) return;
    window.__BE_HEADER_INITED__ = true;

    initDesktopDropdowns();
    initSectionNavigation();

    console.log("BetEngine Header (desktop) initialized v10");
}

/*******************************************************
 * LISTENER – HEADER READY
 *******************************************************/
document.addEventListener("headerLoaded", () => {
    initHeaderModules();
});
