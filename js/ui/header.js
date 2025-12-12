/*********************************************************
 * BetEngine Enterprise – HEADER.JS (FINAL v10.0)
 * Compatible with:
 *  - core.js v5.0
 *  - header-loader.js
 *  - header-mobile.js v5.0
 *  - auth.css / header-auth.js
 *  - desktop.css / mobile.css
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    /*********************************************************
     * SAFE HELPERS
     *********************************************************/
    const qs  = (sel, scope = document) => scope.querySelector(sel);
    const qa  = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const add = (el, c) => el?.classList.add(c);
    const rem = (el, c) => el?.classList.remove(c);

    const on = (el, ev, fn) => el?.addEventListener(ev, fn);

    const closeAll = () => {
        qa(".odds-dropdown, .language-dropdown, .tools-dropdown")
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
        const oddsItems    = qs(".odds-dropdown", header)?.querySelectorAll(".item") || [];
        const oddsLabel    = qs(".odds-label", header);

        if (oddsToggle && oddsDropdown) {
            on(oddsToggle, "click", (e) => {
                e.stopPropagation();
                const open = oddsDropdown.classList.contains("show");
                closeAll();
                if (!open) add(oddsDropdown, "show");
            });

            oddsItems.forEach(item => {
                on(item, "click", (e) => {
                    e.stopPropagation();

                    oddsItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const clean = item.textContent.split("(")[0].trim();

                    if (oddsLabel) oddsLabel.textContent = clean;

                    const mobileValue = qs(".mobile-odds-toggle .value");
                    if (mobileValue) mobileValue.textContent = clean;

                    rem(oddsDropdown, "show");
                });
            });
        }

        /* ---------------- LANGUAGE ---------------- */
        const langToggle   = qs(".language-toggle", header);
        const langDropdown = qs(".language-dropdown", header);
        const langItems    = langDropdown?.querySelectorAll(".item") || [];
        const langLabel    = qs(".language-selector .lang-code", header);

        if (langToggle && langDropdown) {
            on(langToggle, "click", (e) => {
                e.stopPropagation();
                const open = langDropdown.classList.contains("show");
                closeAll();
                if (!open) add(langDropdown, "show");
            });

            langItems.forEach(item => {
                on(item, "click", () => {

                    langItems.forEach(i => i.classList.remove("active"));
                    item.classList.add("active");

                    const label = item.textContent;
                    const code  = (item.dataset.lang || "EN").toUpperCase();

                    if (langLabel) langLabel.textContent = label;

                    const mobileLang = qs(".mobile-lang-toggle .lang-code");
                    if (mobileLang) mobileLang.textContent = code;

                    rem(langDropdown, "show");
                });
            });
        }

        /* ---------------- TOOLS ---------------- */
        const toolsTrigger  = qs(".sub-item-tools", header);
        const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

        if (toolsTrigger && toolsDropdown) {
            on(toolsTrigger, "click", (e) => {
                e.stopPropagation();
                const open = toolsDropdown.classList.contains("show");
                closeAll();
                if (!open) add(toolsDropdown, "show");
            });
        }

        /* ---------------- OUTSIDE CLICK ---------------- */
        document.addEventListener("click", (e) => {
            if (
                !e.target.closest(".odds-format") &&
                !e.target.closest(".language-selector") &&
                !e.target.closest(".sub-item-tools")
            ) {
                closeAll();
            }
        });

        /* ---------------- ESC CLOSE ---------------- */
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAll();
        });
    }

    /*********************************************************
     * DESKTOP <-> MOBILE NAV SYNC
     *********************************************************/
    function initSectionNavigation() {

        const dMain = qa(".main-nav .nav-item");
        const dSub  = qa(".row-sub .subnav-group");

        const activate = (section) => {
            dMain.forEach(i =>
                i.classList.toggle("active", i.dataset.section === section)
            );

            dSub.forEach(g =>
                g.classList.toggle("active", g.dataset.subnav === section)
            );
        };

        window.BE_activateSection = activate;

        dMain.forEach(item => {
            on(item, "click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    }

    /*********************************************************
     * MOBILE MODAL (Odds / Lang / Tools)
     *********************************************************/
    function initMobileModal() {

        const modal = qs("#mobile-header-modal");
        if (!modal) return;

        const title    = qs(".be-modal-title", modal);
        const sections = qa(".be-modal-section", modal);
        const closeBtn = qs(".be-modal-close", modal);

        const mOdds = qs(".mobile-odds-toggle");
        const mLang = qs(".mobile-lang-toggle");
        const mTools = qs(".mobile-tools-trigger");

        const showSection = (type, label) => {
            sections.forEach(s => s.classList.remove("active"));
            const active = modal.querySelector(`.modal-${type}`);
            if (active) active.classList.add("active");

            if (title) title.textContent = label;

            modOpen();
        };

        const modOpen = () => {
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
        };

        const modClose = () => {
            modal.classList.remove("show");
            document.body.style.overflow = "";
        };

        on(closeBtn, "click", modClose);
        on(modal, "click", e => { if (e.target === modal) modClose(); });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") modClose();
        });

        /* Odds / Language / Tools selections inside modal */
        const oddsItems = qa(".modal-odds .be-modal-item", modal);
        oddsItems.forEach(item => {
            on(item, "click", () => {
                const clean = item.textContent.split("(")[0].trim();
                const mobileVal = qs(".mobile-odds-toggle .value");
                if (mobileVal) mobileVal.textContent = clean;

                const dItems = qa(".header-desktop .odds-dropdown .item");
                dItems.forEach(i => i.classList.remove("active"));
                dItems.forEach(i => {
                    if (i.dataset.odds === item.dataset.odds) i.classList.add("active");
                });

                const dLabel = qs(".header-desktop .odds-label");
                if (dLabel) dLabel.textContent = clean;

                modClose();
            });
        });

        const langItems = qa(".modal-language .be-modal-item", modal);
        langItems.forEach(item => {
            on(item, "click", () => {
                const label = item.textContent;
                const code = (item.dataset.lang || "EN").toUpperCase();

                const mobileCode = qs(".mobile-lang-toggle .lang-code");
                if (mobileCode) mobileCode.textContent = code;

                const dItems = qa(".header-desktop .language-dropdown .item");
                dItems.forEach(i => i.classList.remove("active"));
                dItems.forEach(i => {
                    if (i.dataset.lang === item.dataset.lang) i.classList.add("active");
                });

                const dLabel = qs(".header-desktop .lang-code");
                if (dLabel) dLabel.textContent = label;

                modClose();
            });
        });

        /* Tools items simply close modal */
        const toolItems = qa(".modal-tools .be-modal-item", modal);
        toolItems.forEach(item => on(item, "click", modClose));
    }

    /*********************************************************
     * INITIALIZATION MASTER
     *********************************************************/
    initDesktopDropdowns();
    initSectionNavigation();
    initMobileModal();

    console.log("HEADER.JS – FINAL v10.0 initialized");
});
