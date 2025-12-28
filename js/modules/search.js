/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (CANONICAL FINAL)
 * Desktop + Mobile (single source of truth)
 *
 * Guarantees:
 * - Desktop search preserved
 * - Mobile overlay open/close handled here only
 * - No dependency on header-mobile.js
 * - Pointer-safe (touch + mouse)
 * - No global exports
 *********************************************************/

(function () {
    "use strict";

    /* =========================
       HELPERS
    ========================= */
    const $ = (sel, scope = document) => scope.querySelector(sel);
    const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const debounce = (fn, delay = 300) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(null, args), delay);
        };
    };

    const isMobileViewport = () => window.matchMedia("(max-width: 900px)").matches;

    const closestSearchRoot = (node) => {
        if (!node) return null;
        if (node.classList && node.classList.contains("be-search")) return node;
        return node.closest ? node.closest(".be-search") : null;
    };

    /* =========================
       MOCK DATA (PLACEHOLDER)
    ========================= */
    const MOCK_DATA = [
        { type: "Team", title: "Manchester United", meta: "England · Premier League" },
        { type: "Team", title: "Real Madrid", meta: "Spain · La Liga" },
        { type: "Team", title: "Bayern Munich", meta: "Germany · Bundesliga" },
        { type: "Player", title: "Lionel Messi", meta: "Inter Miami · Forward" },
        { type: "Player", title: "Cristiano Ronaldo", meta: "Al Nassr · Forward" },
        { type: "League", title: "Premier League", meta: "England" },
        { type: "League", title: "Champions League", meta: "UEFA" }
    ];

    /* =========================
       CORE SEARCH (PER ROOT)
    ========================= */
    function initSearchRoot(root) {
        const searchRoot = closestSearchRoot(root);
        if (!searchRoot || searchRoot.dataset.beSearchInit === "1") return;

        const input = $(".be-search-input", searchRoot);
        const clearBtn = $(".be-search-clear", searchRoot);
        const closeBtn = $(".be-search-close", searchRoot);
        const resultsList = $(".be-search-results", searchRoot);
        const loadingEl = $(".be-search-loading", searchRoot);
        const emptyEl = $(".be-search-empty", searchRoot);

        if (!input || !clearBtn || !resultsList || !loadingEl || !emptyEl) return;

        searchRoot.dataset.beSearchInit = "1";

        let activeIndex = -1;
        let currentResults = [];

        const showClose = (show) => {
            if (!closeBtn) return;
            closeBtn.hidden = !show;
        };

        const clearResults = () => {
            resultsList.innerHTML = "";
            currentResults = [];
            activeIndex = -1;
        };

        const showLoading = (show) => {
            loadingEl.hidden = !show;
        };

        const showEmpty = (show) => {
            emptyEl.hidden = !show;
        };

        const setActive = (index) => {
            const items = $$(".be-search-result", resultsList);
            items.forEach(el => el.classList.remove("is-active"));
            if (items[index]) {
                items[index].classList.add("is-active");
                items[index].scrollIntoView({ block: "nearest" });
            }
            activeIndex = index;
        };

        const selectIndex = (index) => {
            const item = currentResults[index];
            if (!item) return;

            // Placeholder selection behavior
            // console.log("[SEARCH] Selected:", item);

            input.value = "";
            clearBtn.hidden = true;
            showClose(false);
            showLoading(false);
            showEmpty(false);
            clearResults();
            input.blur();
        };

        const renderResults = (items) => {
            clearResults();

            items.forEach((item, idx) => {
                const li = document.createElement("li");
                li.className = "be-search-result";
                li.dataset.index = String(idx);

                li.innerHTML = `
                    <span class="be-search-result-icon">${item.type[0]}</span>
                    <div class="be-search-result-content">
                        <div class="be-search-result-title">${item.title}</div>
                        <div class="be-search-result-meta">${item.meta}</div>
                    </div>
                `;

                li.addEventListener("pointerdown", (e) => e.stopPropagation(), { passive: true });
                li.addEventListener("click", () => selectIndex(idx));

                resultsList.appendChild(li);
            });

            currentResults = items;
        };

        const performSearch = (query) => {
            showLoading(true);
            showEmpty(false);
            clearResults();

            setTimeout(() => {
                const q = query.toLowerCase();
                const matches = MOCK_DATA.filter(item =>
                    item.title.toLowerCase().includes(q)
                );

                showLoading(false);

                if (!matches.length) {
                    showEmpty(true);
                    return;
                }

                renderResults(matches);
            }, 200);
        };

        const debouncedSearch = debounce((value) => {
            const v = String(value || "").trim();

            if (!v) {
                showLoading(false);
                showEmpty(false);
                clearResults();
                clearBtn.hidden = true;
                showClose(false);
                return;
            }

            clearBtn.hidden = false;
            showClose(true);
            performSearch(v);
        }, 250);

        // Input lifecycle
        input.addEventListener("focus", () => {
            // Only show close if there is state (value or results)
            const hasValue = !!String(input.value || "").trim();
            const hasResults = resultsList.children.length > 0;
            showClose(hasValue || hasResults);
        });

        input.addEventListener("input", (e) => {
            debouncedSearch(e.target.value);
        });

        input.addEventListener("keydown", (e) => {
            const count = currentResults.length;
            if (!count) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((activeIndex + 1) % count);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((activeIndex - 1 + count) % count);
            } else if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                selectIndex(activeIndex);
            }
        });

        // Clear button
        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.hidden = true;
            showClose(false);
            showLoading(false);
            showEmpty(false);
            clearResults();
            input.focus();
        });

        // Close (X) button: close state + (if mobile overlay is open) close overlay
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.preventDefault();

                input.value = "";
                clearBtn.hidden = true;
                showClose(false);
                showLoading(false);
                showEmpty(false);
                clearResults();
                input.blur();

                const mobilePanel = searchRoot.closest(".mobile-search-inline");
                if (mobilePanel) {
                    closeMobileOverlay();
                }
            });
        }
    }

    function initAllSearch() {
        $$(".be-search").forEach(initSearchRoot);
    }

    /* =========================
       MOBILE OVERLAY (CANONICAL)
    ========================= */
    function getMobilePanel() {
        return document.querySelector(".mobile-search-inline");
    }

    function getMobileButton() {
        return document.querySelector(".mobile-search-btn");
    }

    function openMobileOverlay() {
        const panel = getMobilePanel();
        if (!panel) return;

        panel.removeAttribute("hidden");
        panel.setAttribute("aria-hidden", "false");
        document.body.classList.add("mobile-search-open");

        const input = panel.querySelector(".be-search-input");
        if (input) {
            input.focus();
        }
    }

    function closeMobileOverlay() {
        const panel = getMobilePanel();
        if (!panel) return;

        panel.setAttribute("hidden", "");
        panel.setAttribute("aria-hidden", "true");
        document.body.classList.remove("mobile-search-open");

        const searchRoot = panel.querySelector(".be-search");
        if (searchRoot) {
            const input = $(".be-search-input", searchRoot);
            const clearBtn = $(".be-search-clear", searchRoot);
            const closeBtn = $(".be-search-close", searchRoot);
            const resultsList = $(".be-search-results", searchRoot);
            const loadingEl = $(".be-search-loading", searchRoot);
            const emptyEl = $(".be-search-empty", searchRoot);

            if (input) input.value = "";
            if (clearBtn) clearBtn.hidden = true;
            if (closeBtn) closeBtn.hidden = true;
            if (loadingEl) loadingEl.hidden = true;
            if (emptyEl) emptyEl.hidden = true;
            if (resultsList) resultsList.innerHTML = "";
        }
    }

    function initMobileOverlayController() {
        const btn = getMobileButton();
        const panel = getMobilePanel();
        if (!btn || !panel) return;

        if (panel.dataset.mobileSearchInit === "1") return;
        panel.dataset.mobileSearchInit = "1";

        // Ensure search root init inside panel
        initAllSearch();

        // Toggle by button
        btn.addEventListener("click", (e) => {
            e.preventDefault();

            // Only manage overlay in mobile viewport
            if (!isMobileViewport()) return;

            if (panel.hasAttribute("hidden")) openMobileOverlay();
            else closeMobileOverlay();
        });

        // Click outside to close (pointer-safe)
        document.addEventListener("pointerdown", (e) => {
            if (!isMobileViewport()) return;
            if (panel.hasAttribute("hidden")) return;

            const target = e.target;
            const clickedInside = panel.contains(target);
            const clickedButton = btn.contains(target);

            if (clickedInside || clickedButton) return;

            closeMobileOverlay();
        }, { passive: true });

        // ESC to close
        document.addEventListener("keydown", (e) => {
            if (!isMobileViewport()) return;
            if (e.key !== "Escape") return;
            if (panel.hasAttribute("hidden")) return;

            closeMobileOverlay();
        });
    }

    /* =========================
       BOOT
    ========================= */
    document.addEventListener("DOMContentLoaded", () => {
        initAllSearch();
        initMobileOverlayController();
    });

    document.addEventListener("headerLoaded", () => {
        initAllSearch();
        initMobileOverlayController();
    });

    // Optional: close overlay if viewport leaves mobile while open
    window.addEventListener("resize", debounce(() => {
        if (!isMobileViewport()) {
            if (document.body.classList.contains("mobile-search-open")) {
                closeMobileOverlay();
            }
        }
    }, 150));

    // console.log("search.js CANONICAL FINAL loaded");
})();
