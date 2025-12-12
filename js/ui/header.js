/*********************************************************
 * BetEngine Enterprise – HEADER.JS (FINAL v10.1)
 * DESKTOP-ONLY MODULE
 * - Desktop dropdowns: Odds, Language, Betting Tools
 * - Section navigation (Row 2 -> Row 3)
 * - Exposes: window.BE_activateSection(section)
 *
 * IMPORTANT:
 * - NO mobile hamburger logic here
 * - NO mobile modal logic here
 *   (mobile logic must live in header-mobile.js)
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /*********************************************************
     * SAFE HELPERS
     *********************************************************/
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const add = (el, c) => el && el.classList.add(c);
    const rem = (el, c) => el && el.classList.remove(c);
    const on  = (el, ev, fn) => el && el.addEventListener(ev, fn);

    const closeAllDesktopDropdowns = () => {
        qa(".header-desktop .odds-dropdown, .header-desktop .language-dropdown, .header-desktop .tools-dropdown")
            .forEach(el => rem(el, "show"));
    };

    /*********************************************************
     * DESKTOP DROPDOWNS
     *********************************************************/
    function initDesktopDropdowns() {

        const header = qs(".header-desktop");
        if (!header) return;

        /* ----------------- ODDS ----------------- */
        const oddsToggle   = qs(".odds-format .odds-toggle", header);
        const oddsDropdown = qs(".odds-dropdown", header);
        const oddsItems    = oddsDropdown ? qa(".item", oddsDropdown) : [];
        const oddsLabel    = qs(".odds-label", header);

        if (oddsToggle && oddsDropdown) {
            on(oddsToggle, "click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = oddsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!isOpen) add(oddsDropdown, "show");
            });

            oddsItems.forEach(item => {
                on(item, "click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const clean = (item.textContent || "").split("(")[0].trim();
                    if (oddsLabel) oddsLabel.textContent = clean;

                    rem(oddsDropdown, "show");
                });
            });
        }

        /* ---------------- LANGUAGE ---------------- */
        const langToggle   = qs(".language-toggle", header);
        const langDropdown = qs(".language-dropdown", header);
        const langItems    = langDropdown ? qa(".item", langDropdown) : [];
        const langLabel    = qs(".language-selector .lang-code", header);

        if (langToggle && langDropdown) {
            on(langToggle, "click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = langDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!isOpen) add(langDropdown, "show");
            });

            langItems.forEach(item => {
                on(item, "click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const label = item.textContent || "English";
                    if (langLabel) langLabel.textContent = label;

                    rem(langDropdown, "show");
                });
            });
        }

        /* ---------------- TOOLS ---------------- */
        const toolsTrigger  = qs(".sub-item-tools", header);
        const toolsDropdown = toolsTrigger ? qs(".tools-dropdown", toolsTrigger) : null;

        if (toolsTrigger && toolsDropdown) {
            on(toolsTrigger, "click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const isOpen = toolsDropdown.classList.contains("show");
                closeAllDesktopDropdowns();
                if (!isOpen) add(toolsDropdown, "show");
            });
        }

        /* ---------------- OUTSIDE CLICK (DESKTOP ONLY) ---------------- */
        document.addEventListener("click", (e) => {
            // IMPORTANT: do NOT react to clicks coming from mobile menu/modal
            if (
                e.target.closest(".mobile-menu-panel") ||
                e.target.closest(".mobile-menu-overlay") ||
                e.target.closest("#mobile-header-modal")
            ) {
                return;
            }

            if (
                !e.target.closest(".header-desktop .odds-format") &&
                !e.target.closest(".header-desktop .language-selector") &&
                !e.target.closest(".header-desktop .sub-item-tools")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        /* ---------------- ESC CLOSE (DESKTOP DROPDOWNS ONLY) ---------------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllDesktopDropdowns();
        });
    }

    /*********************************************************
     * SECTION NAVIGATION (DESKTOP) + EXPOSE SYNC API
     *********************************************************/
    function initSectionNavigation() {

        const dMain = qa(".header-desktop .main-nav .nav-item");
        const dSub  = qa(".header-desktop .row-sub .subnav-group");

        const activate = (section) => {
            if (!section) return;

            dMain.forEach(i =>
                i.classList.toggle("active", i.dataset.section === section)
            );

            dSub.forEach(g =>
                g.classList.toggle("active", g.dataset.subnav === section)
            );
        };

        // Expose for mobile hamburger module
        window.BE_activateSection = activate;

        dMain.forEach(item => {
            on(item, "click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    }

    /*********************************************************
     * INIT (DESKTOP ONLY)
     *********************************************************/
    initDesktopDropdowns();
    initSectionNavigation();

    console.log("HEADER.JS – FINAL v10.1 initialized (DESKTOP ONLY)");
});
