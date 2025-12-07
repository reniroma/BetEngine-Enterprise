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
            panel: document.querySelector(".odds-dropdown")
        },
        lang: {
            toggle: document.querySelector(".language-toggle"),
            panel: document.querySelector(".language-dropdown")
        },
        tools: {
            toggle: document.querySelector(".sub-item-tools"),
            panel: document.querySelector(".sub-item-tools .tools-dropdown")
        }
    };

    function closeAllDropdowns() {
        document
            .querySelectorAll(".odds-dropdown, .language-dropdown, .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    }

    Object.values(dropdowns).forEach(entry => {
        if (!entry.toggle || !entry.panel) return;

        entry.toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            entry.panel.classList.toggle("show");
        });

        entry.panel.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

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

    if (hamburger && mobileHeader) {
        hamburger.addEventListener("click", () => {
            mobileHeader.classList.toggle("open");
        });
    }


    /********************************************************
     * MOBILE MODAL SYSTEM (BOTTOM SHEETS)
     ********************************************************/
    const body = document.body;
    const mobileModals = document.querySelectorAll(".mobile-modal");

    function openMobileModal(type) {
        const modal = document.querySelector(`.mobile-modal[data-modal="${type}"]`);
        if (!modal) return;
        modal.classList.add("is-open");
        body.classList.add("no-scroll-mobile-modal");
    }

    function closeMobileModal(modal) {
        if (!modal) return;
        modal.classList.remove("is-open");

        const stillOpen = document.querySelector(".mobile-modal.is-open");
        if (!stillOpen) {
            body.classList.remove("no-scroll-mobile-modal");
        }
    }

    mobileModals.forEach(modal => {
        const overlay = modal.querySelector(".mobile-modal-overlay");
        const closeBtn = modal.querySelector(".mobile-modal-close");

        if (overlay) {
            overlay.addEventListener("click", () => {
                closeMobileModal(modal);
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                closeMobileModal(modal);
            });
        }
    });


    /********************************************************
     * MOBILE — Odds & Language Toggle → open modals
     ********************************************************/
    const mobileOddsToggle = document.querySelector(".header-mobile .odds-toggle");
    const mobileLangToggle = document.querySelector(".header-mobile .lang-toggle");

    if (mobileOddsToggle) {
        mobileOddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            openMobileModal("odds");
        });
    }

    if (mobileLangToggle) {
        mobileLangToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            openMobileModal("lang");
        });
    }

    /********************************************************
     * MOBILE — Apply selection (Odds + Language)
     ********************************************************/
    const oddsValueEl = document.querySelector(".header-mobile .odds-toggle .value");
    const langCodeEl = document.querySelector(".header-mobile .lang-toggle .lang-code");

    const oddsItems = document.querySelectorAll('.mobile-modal[data-modal="odds"] .mobile-modal-item');
    oddsItems.forEach(btn => {
        btn.addEventListener("click", () => {
            const label = btn.getAttribute("data-odds-label") || btn.textContent.trim();
            if (oddsValueEl && label) {
                oddsValueEl.textContent = label;
            }
            const modal = btn.closest(".mobile-modal");
            closeMobileModal(modal);
        });
    });

    const langItems = document.querySelectorAll('.mobile-modal[data-modal="lang"] .mobile-modal-item');
    langItems.forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.getAttribute("data-lang-code");
            const label = btn.getAttribute("data-lang-label") || btn.textContent.trim();

            if (langCodeEl && code) {
                langCodeEl.textContent = code;
            }

            const modal = btn.closest(".mobile-modal");
            closeMobileModal(modal);
        });
    });


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
