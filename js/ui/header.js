/*******************************************************
 * BetEngine – HEADER FINAL JS
 * Desktop + Mobile (separated)
 *******************************************************/

document.addEventListener("DOMContentLoaded", () => {
    const isDesktop = window.innerWidth >= 980;

    if (isDesktop) {
        initDesktopHeader();
    } else {
        initMobileHeader();
    }
});

/* =====================================================
   DESKTOP HEADER LOGIC
===================================================== */

function initDesktopHeader() {
    const oddsToggle = document.querySelector(".header-desktop .odds-toggle");
    const oddsDropdown = document.querySelector(".header-desktop .odds-dropdown");

    const langToggle = document.querySelector(".header-desktop .language-toggle");
    const langDropdown = document.querySelector(".header-desktop .language-dropdown");

    const toolsToggle = document.querySelector(".header-desktop .sub-item-tools");
    const toolsDropdown = document.querySelector(".header-desktop .sub-item-tools .tools-dropdown");

    const navItems = document.querySelectorAll(".header-desktop .main-nav .nav-item");
    const subnavGroups = document.querySelectorAll(".header-desktop .row-sub .subnav-group");

    function closeAllDropdowns() {
        document
            .querySelectorAll(".header-desktop .odds-dropdown, .header-desktop .language-dropdown, .header-desktop .tools-dropdown")
            .forEach(el => el.classList.remove("show"));
    }

    if (oddsToggle && oddsDropdown) {
        oddsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            oddsDropdown.classList.toggle("show");
        });
    }

    if (langToggle && langDropdown) {
        langToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            langDropdown.classList.toggle("show");
        });

        // update label when selecting language
        langDropdown.querySelectorAll(".item").forEach(item => {
            item.addEventListener("click", () => {
                const codeSpan = langToggle.querySelector(".lang-code");
                const value = item.textContent.trim();
                if (codeSpan && value) {
                    codeSpan.textContent = value;
                }
                closeAllDropdowns();
            });
        });
    }

    if (toolsToggle && toolsDropdown) {
        toolsToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            toolsDropdown.classList.toggle("show");
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

    // Subnav switching
    if (navItems.length && subnavGroups.length) {
        navItems.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();

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
    }
}

/* =====================================================
   MOBILE HEADER LOGIC (MODAL FULLSCREEN)
===================================================== */

function initMobileHeader() {
    const mobileHeader = document.querySelector(".header-mobile");
    if (!mobileHeader) return;

    const hamburger = mobileHeader.querySelector(".hamburger");
    const oddsButton = mobileHeader.querySelector(".mobile-odds-toggle");
    const langButton = mobileHeader.querySelector(".mobile-lang-toggle");
    const toolsButton = mobileHeader.querySelector(".mobile-tools-trigger");

    const chips = mobileHeader.querySelectorAll(".nav-chip");
    const subnavGroups = document.querySelectorAll(".header-mobile .mobile-sub-nav .subnav-group");

    const modalOverlay = document.getElementById("mobile-header-modal");
    if (!modalOverlay) return;

    const modalTitle = modalOverlay.querySelector(".be-modal-title");
    const modalSections = modalOverlay.querySelectorAll(".be-modal-section");
    const modalCloseBtn = modalOverlay.querySelector(".be-modal-close");

    function setBodyScrollLock(lock) {
        if (lock) {
            document.body.classList.add("be-modal-open");
        } else {
            document.body.classList.remove("be-modal-open");
        }
    }

    function openModal(type) {
        if (!modalOverlay) return;

        modalSections.forEach(sec => sec.classList.remove("active"));

        if (type === "odds") {
            modalTitle.textContent = "Select odds format";
            const panel = modalOverlay.querySelector(".modal-odds");
            if (panel) panel.classList.add("active");
        } else if (type === "language") {
            modalTitle.textContent = "Select language";
            const panel = modalOverlay.querySelector(".modal-language");
            if (panel) panel.classList.add("active");
        } else if (type === "tools") {
            modalTitle.textContent = "Betting tools";
            const panel = modalOverlay.querySelector(".modal-tools");
            if (panel) panel.classList.add("active");
        }

        modalOverlay.classList.add("open");
        modalOverlay.setAttribute("aria-hidden", "false");
        setBodyScrollLock(true);
    }

    function closeModal() {
        modalOverlay.classList.remove("open");
        modalOverlay.setAttribute("aria-hidden", "true");
        setBodyScrollLock(false);
    }

    // Hamburger (placeholder – only visual toggle)
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            mobileHeader.classList.toggle("open");
        });
    }

    // Open modals
    if (oddsButton) {
        oddsButton.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("odds");
        });
    }

    if (langButton) {
        langButton.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("language");
        });
    }

    if (toolsButton) {
        toolsButton.addEventListener("click", (e) => {
            e.stopPropagation();
            openModal("tools");
        });
    }

    // Modal close button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", () => {
            closeModal();
        });
    }

    // Click outside modal content closes
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Prevent clicks inside modal from closing
    const modalBox = modalOverlay.querySelector(".be-modal");
    if (modalBox) {
        modalBox.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    // Odds selection (mobile)
    const oddsItems = modalOverlay.querySelectorAll(".modal-odds .be-modal-item");
    oddsItems.forEach(item => {
        item.addEventListener("click", () => {
            const valueSpan = oddsButton ? oddsButton.querySelector(".value") : null;
            if (valueSpan) {
                valueSpan.textContent = item.textContent.trim();
            }
            closeModal();
        });
    });

    // Language selection (mobile)
    const langItems = modalOverlay.querySelectorAll(".modal-language .be-modal-item");
    langItems.forEach(item => {
        item.addEventListener("click", () => {
            const codeSpan = langButton ? langButton.querySelector(".lang-code") : null;
            const desktopLangCode = document.querySelector(".header-desktop .language-toggle .lang-code");
            if (codeSpan) {
                codeSpan.textContent = item.textContent.trim().slice(0, 2).toUpperCase();
            }
            if (desktopLangCode) {
                desktopLangCode.textContent = item.textContent.trim();
            }
            closeModal();
        });
    });

    // Tools selection (placeholder – for now just close)
    const toolItems = modalOverlay.querySelectorAll(".modal-tools .be-modal-item");
    toolItems.forEach(item => {
        item.addEventListener("click", () => {
            closeModal();
        });
    });

    // NAV CHIPS (ODDS / COMMUNITY / BOOKMAKERS / PREMIUM)
    if (chips.length && subnavGroups.length) {
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                chips.forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                const section = chip.getAttribute("data-section");

                subnavGroups.forEach(group => {
                    group.classList.remove("active");
                    if (group.getAttribute("data-subnav") === section) {
                        group.classList.add("active");
                    }
                });
            });
        });
    }
}
