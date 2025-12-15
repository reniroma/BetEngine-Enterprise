/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v7.3)
 * Desktop + Mobile header behaviour
 * FIX: Correct event binding for injected header
 *********************************************************/

/*******************************************************
 * GLOBAL STATE (SINGLE SOURCE OF TRUTH)
 *******************************************************/
let desktopListenersAttached = false;

const state = {
    desktopDropdownOpen: false
};

/*******************************************************
 * UTILS
 *******************************************************/
const isInside = (target, selector) => {
    return !!(target && target.closest(selector));
};

const closeAllDesktopDropdowns = () => {
    document
        .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
        .forEach(el => el.classList.remove("show"));

    state.desktopDropdownOpen = false;
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
    const oddsItems    = oddsDropdown?.querySelectorAll(".item") || [];
    const oddsLabel    = header.querySelector(".odds-label");

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = oddsDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                oddsDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                oddsItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const clean = item.textContent.split("(")[0].trim();
                if (oddsLabel) oddsLabel.textContent = clean;

                closeAllDesktopDropdowns();
            });
        });
    }

    /* ---------------- LANGUAGE ---------------- */
    const langToggle   = header.querySelector(".language-toggle");
    const langDropdown = header.querySelector(".language-dropdown");
    const langItems    = langDropdown?.querySelectorAll(".item") || [];
    const langLabel    = header.querySelector(".language-selector .lang-code");

    if (langToggle && langDropdown) {
        langToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = langDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                langDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });

        langItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();

                langItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                if (langLabel) langLabel.textContent = item.textContent;

                closeAllDesktopDropdowns();
            });
        });
    }

    /* ---------------- BETTING TOOLS ---------------- */
    const toolsTrigger  = header.querySelector(".sub-item-tools");
    const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

    if (toolsTrigger && toolsDropdown) {
        toolsTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = toolsDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                toolsDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });
    }
}

/*******************************************************
 * GLOBAL DESKTOP LISTENERS (SINGLETON)
 *******************************************************/
function attachDesktopGlobalListeners() {
    if (desktopListenersAttached) return;
    desktopListenersAttached = true;

    document.addEventListener("click", (e) => {
        if (!state.desktopDropdownOpen) return;

        if (
            !isInside(e.target, ".odds-format") &&
            !isInside(e.target, ".language-selector") &&
            !isInside(e.target, ".sub-item-tools")
        ) {
            closeAllDesktopDropdowns();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!state.desktopDropdownOpen) return;

        closeAllDesktopDropdowns();
    });
}

/*******************************************************
 * NAVIGATION SYNC
 *******************************************************/
function initSectionNavigation() {
    const dMain = document.querySelectorAll(".main-nav .nav-item");
    const dSub  = document.querySelectorAll(".row-sub .subnav-group");

    const activate = (section) => {
        dMain.forEach(i =>
            i.classList.toggle("active", i.dataset.section === section)
        );

        dSub.forEach(g =>
            g.classList.toggle("active", g.dataset.subnav === section)
        );
    };

    dMain.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            activate(item.dataset.section);
        });
    });
}

/*******************************************************
 * INIT (CALLED AFTER HEADER INJECTION)
 *******************************************************/
function initHeader() {
    initDesktopDropdowns();
    attachDesktopGlobalListeners();
    initSectionNavigation();
}

/*******************************************************
 * EVENT BINDING (FIXED)
 *******************************************************/
document.addEventListener("headerLoaded", initHeader);

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
    initHeader();
}
