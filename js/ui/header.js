/*********************************************************
 * BetEngine Enterprise – HEADER JS (ENTERPRISE v7.4)
 * Desktop-only header behaviour
 *
 * ENTERPRISE FIX:
 * - Strict DOM scoping enforcement
 * - Desktop JS NEVER interferes with mobile DOM
 *********************************************************/

/*******************************************************
 * GLOBAL STATE (DESKTOP ONLY)
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

const isMobileDOM = (target) => {
    return (
        isInside(target, ".mobile-only") ||
        isInside(target, ".mobile-menu-panel") ||
        isInside(target, ".mobile-menu-overlay")
    );
};

const closeAllDesktopDropdowns = () => {
    document
        .querySelectorAll(".header-desktop .odds-dropdown, .header-desktop .language-dropdown, .header-desktop .auth-user-dropdown, .header-desktop .tools-dropdown")
        .forEach(el => el.classList.remove("show"));

    state.desktopDropdownOpen = false;
};
const closeDesktopSearch = () => {
  const searchRoot = document.querySelector(".header-desktop .be-search");
  if (!searchRoot) return;

  const input = searchRoot.querySelector(".be-search-input");
  if (input) input.blur();

  searchRoot.classList.remove("show", "open", "active");
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
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();
            closeDesktopSearch();
            const open = oddsDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                oddsDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                if (isMobileDOM(e.target)) return;

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
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();
            closeDesktopSearch();
            const open = langDropdown.classList.contains("show");
            closeAllDesktopDropdowns();
            if (!open) {
                langDropdown.classList.add("show");
                state.desktopDropdownOpen = true;
            }
        });

        langItems.forEach(item => {
            item.addEventListener("click", (e) => {
                if (isMobileDOM(e.target)) return;

                e.stopPropagation();

                langItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                if (langLabel) langLabel.textContent = item.textContent;

                closeAllDesktopDropdowns();
            });
        });
    }

    /* ---------------- USER ---------------- */
const userToggle   = header.querySelector(".auth-user-toggle");
const userDropdown = header.querySelector(".auth-user-dropdown");

if (userToggle && userDropdown) {
  userToggle.addEventListener("click", (e) => {
    if (isMobileDOM(e.target)) return;

    e.stopPropagation();
     closeDesktopSearch();
    const open = userDropdown.classList.contains("show");
    closeAllDesktopDropdowns();
    if (!open) {
      userDropdown.classList.add("show");
      state.desktopDropdownOpen = true;
    }
  });
}

    /* ---------------- BETTING TOOLS ---------------- */
    const toolsTrigger  = header.querySelector(".sub-item-tools");
    const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

    if (toolsTrigger && toolsDropdown) {
        toolsTrigger.addEventListener("click", (e) => {
            if (isMobileDOM(e.target)) return;

            e.stopPropagation();
            closeDesktopSearch();
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
 * GLOBAL DESKTOP LISTENERS (STRICTLY DESKTOP)
 *******************************************************/
function attachDesktopGlobalListeners() {
    if (desktopListenersAttached) return;
    desktopListenersAttached = true;

    document.addEventListener("click", (e) => {
        if (isMobileDOM(e.target)) return;
        if (!state.desktopDropdownOpen) return;

        if (
            !isInside(e.target, ".header-desktop .odds-format") &&
            !isInside(e.target, ".header-desktop .language-selector") &&
            !isInside(e.target, ".header-desktop .sub-item-tools") &&
            !isInside(e.target, ".header-desktop .auth-user") &&
            !isInside(e.target, ".header-desktop .sub-item-tools")
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
 * NAVIGATION SYNC (DESKTOP ONLY)
 *******************************************************/
function initSectionNavigation() {
    const dMain = document.querySelectorAll(".header-desktop .main-nav .nav-item");
    const dSub  = document.querySelectorAll(".header-desktop .row-sub .subnav-group");

    if (!dMain.length) return;

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
 * INIT (AFTER HEADER INJECTION)
 *******************************************************/
function initHeader() {
    initDesktopDropdowns();
    attachDesktopGlobalListeners();
    initSectionNavigation();
}

/*******************************************************
 * EVENT BINDING
 *******************************************************/
document.addEventListener("headerLoaded", initHeader);

if (window.__BE_HEADER_READY__ === true) {
    initHeader();
}
