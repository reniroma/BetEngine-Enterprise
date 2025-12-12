/*********************************************************
 * BetEngine Enterprise – HEADER.JS (FINAL)
 * Desktop dropdowns + section navigation + mobile modal sync
 * Auth is handled ONLY by header-auth.js
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const closeAllDesktopDropdowns = () => {
        qa(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    };

    /* ---------------- Desktop dropdowns ---------------- */
    const initDesktopDropdowns = () => {
        const header = qs(".header-desktop");
        if (!header) return;

        // Odds
        const oddsToggle = qs(".odds-format .odds-toggle", header);
        const oddsDropdown = qs(".odds-dropdown", header);
        const oddsItems = oddsDropdown ? qa(".item", oddsDropdown) : [];
        const oddsLabel = qs(".odds-label", header);

        oddsToggle?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const open = oddsDropdown?.classList.contains("show");
            closeAllDesktopDropdowns();
            if (oddsDropdown && !open) oddsDropdown.classList.add("show");
        });

        oddsItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                oddsItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const clean = (item.textContent || "").split("(")[0].trim();
                if (oddsLabel) oddsLabel.textContent = clean;

                const menuOddsSpan = qs(".mobile-menu-panel .menu-odds span");
                if (menuOddsSpan) menuOddsSpan.textContent = clean;

                oddsDropdown?.classList.remove("show");
            });
        });

        // Language
        const langToggle = qs(".language-selector .language-toggle", header);
        const langDropdown = qs(".language-dropdown", header);
        const langItems = langDropdown ? qa(".item", langDropdown) : [];
        const langLabel = qs(".language-selector .lang-code", header);

        langToggle?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const open = langDropdown?.classList.contains("show");
            closeAllDesktopDropdowns();
            if (langDropdown && !open) langDropdown.classList.add("show");
        });

        langItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                langItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                const label = item.textContent || "English";
                if (langLabel) langLabel.textContent = label;

                const menuLangSpan = qs(".mobile-menu-panel .menu-lang span");
                if (menuLangSpan) menuLangSpan.textContent = label;

                langDropdown?.classList.remove("show");
            });
        });

        // Tools dropdown
        const toolsTrigger = qs(".sub-item-tools", header);
        const toolsDropdown = toolsTrigger?.querySelector(".tools-dropdown");

        toolsTrigger?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const open = toolsDropdown?.classList.contains("show");
            closeAllDesktopDropdowns();
            if (toolsDropdown && !open) toolsDropdown.classList.add("show");
        });

        // Outside click close
        document.addEventListener("click", (e) => {
            if (
                !e.target.closest(".odds-format") &&
                !e.target.closest(".language-selector") &&
                !e.target.closest(".sub-item-tools")
            ) {
                closeAllDesktopDropdowns();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllDesktopDropdowns();
        });
    };

    /* ---------------- Section navigation ---------------- */
    const initSectionNavigation = () => {
        const dMain = qa(".main-nav .nav-item");
        const dSub = qa(".row-sub .subnav-group");

        const activate = (section) => {
            if (!section) return;
            dMain.forEach(i => i.classList.toggle("active", i.dataset.section === section));
            dSub.forEach(g => g.classList.toggle("active", g.dataset.subnav === section));
        };

        window.BE_activateSection = activate;

        dMain.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                activate(item.dataset.section);
            });
        });
    };

    /* ---------------- Mobile modal close button safety ---------------- */
    const initMobileModalClose = () => {
        const modal = qs("#mobile-header-modal");
        if (!modal) return;

        const closeBtn = qs(".be-modal-close", modal);

        const closeModal = () => {
            modal.classList.remove("show");
            // Do NOT unlock body blindly because hamburger may be open
            // If hamburger is not open, unlock.
            const panel = qs(".mobile-menu-panel");
            const isMenuOpen = panel?.classList.contains("open");
            if (!isMenuOpen) document.body.style.overflow = "";
        };

        closeBtn?.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
        });
    };

    initDesktopDropdowns();
    initSectionNavigation();
    initMobileModalClose();

    console.log("[header.js] Initialized (stable, no auth)");
});
