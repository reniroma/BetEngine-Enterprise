/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE
 * FINAL – SINGLE SOURCE OF TRUTH
 *
 * GUARANTEES
 * - Desktop search preserved 100%
 * - Mobile search overlay controlled ONLY here
 * - No dependency on header-mobile.js
 * - One controller, one state
 * - Predictable open / close / clear
 *********************************************************/

(function () {
    "use strict";

    /* =========================
       HELPERS
    ========================= */
    const $  = (sel, scope = document) => scope.querySelector(sel);
    const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const debounce = (fn, delay = 300) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(null, args), delay);
        };
    };

    /* =========================
       MOCK DATA (PLACEHOLDER)
    ========================= */
    const MOCK_DATA = [
        { type: "Team",   title: "Manchester United", meta: "England · Premier League" },
        { type: "Team",   title: "Real Madrid",       meta: "Spain · La Liga" },
        { type: "Team",   title: "Bayern Munich",     meta: "Germany · Bundesliga" },
        { type: "Player", title: "Lionel Messi",      meta: "Inter Miami · Forward" },
        { type: "Player", title: "Cristiano Ronaldo", meta: "Al Nassr · Forward" },
        { type: "League", title: "Premier League",    meta: "England" },
        { type: "League", title: "Champions League",  meta: "UEFA" }
    ];

    /* =========================
       SEARCH ROOT (DESKTOP + MOBILE)
    ========================= */
    function initSearchRoot(root) {
        if (!root || root.dataset.beSearchInit === "1") return;

        const input       = $(".be-search-input", root);
        const clearBtn    = $(".be-search-clear", root);
        const closeBtn    = $(".be-search-close", root);
        const resultsList = $(".be-search-results", root);
        const loadingEl   = $(".be-search-loading", root);
        const emptyEl     = $(".be-search-empty", root);

        if (!input || !clearBtn || !resultsList || !loadingEl || !emptyEl) return;

        root.dataset.beSearchInit = "1";

        let activeIndex = -1;
        let currentResults = [];

        function clearResults() {
            resultsList.innerHTML = "";
            currentResults = [];
            activeIndex = -1;
        }

        function resetSearch() {
            input.value = "";
            clearResults();
            loadingEl.hidden = true;
            emptyEl.hidden = true;
            clearBtn.hidden = true;
            if (closeBtn) closeBtn.hidden = true;
        }

        function showLoading(show) {
            loadingEl.hidden = !show;
        }

        function showEmpty(show) {
            emptyEl.hidden = !show;
        }

        function setActive(index) {
            const items = $$(".be-search-result", resultsList);
            items.forEach(el => el.classList.remove("is-active"));
            if (items[index]) {
                items[index].classList.add("is-active");
                items[index].scrollIntoView({ block: "nearest" });
            }
            activeIndex = index;
        }

        function selectIndex(index) {
            const item = currentResults[index];
            if (!item) return;

            console.log("[SEARCH] Selected:", item);
            resetSearch();
            input.blur();
        }

        function renderResults(items) {
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

                li.addEventListener("mousedown", e => e.stopPropagation());
                li.addEventListener("click", () => selectIndex(idx));

                resultsList.appendChild(li);
            });

            currentResults = items;
        }

        function performSearch(query) {
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
        }

        const debouncedSearch = debounce((value) => {
            if (!value.trim()) {
                resetSearch();
                return;
            }

            clearBtn.hidden = false;
            if (closeBtn) closeBtn.hidden = false;
            performSearch(value);
        }, 250);

        input.addEventListener("input", e => {
            debouncedSearch(e.target.value);
        });

        input.addEventListener("keydown", e => {
            const count = currentResults.length;
            if (!count) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((activeIndex + 1) % count);
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((activeIndex - 1 + count) % count);
            }

            if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                selectIndex(activeIndex);
            }

            if (e.key === "Escape") {
                resetSearch();
                input.blur();
            }
        });

        clearBtn.addEventListener("click", () => {
            resetSearch();
            input.focus();
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                resetSearch();
                input.blur();
            });
        }

        document.addEventListener("pointerdown", e => {
            if (!root.contains(e.target)) {
                resetSearch();
            }
        });
    }

    /* =========================
       INIT – DESKTOP + MOBILE
    ========================= */
    function initAllSearch() {
        $$(".be-search").forEach(initSearchRoot);
    }

    document.addEventListener("DOMContentLoaded", initAllSearch);
    document.addEventListener("headerLoaded", initAllSearch);

    /* =========================
       MOBILE SEARCH TOGGLE
    ========================= */
    function initMobileSearchToggle() {
        const btn   = $(".mobile-search-btn");
        const panel = $(".mobile-search-inline");

        if (!btn || !panel) return;
        if (panel.dataset.mobileInit === "1") return;
        panel.dataset.mobileInit = "1";

        btn.addEventListener("click", e => {
            e.preventDefault();
            panel.hidden = !panel.hidden;
            panel.setAttribute("aria-hidden", String(panel.hidden));

            if (!panel.hidden) {
                const input = $(".be-search-input", panel);
                input && input.focus();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initMobileSearchToggle);
    document.addEventListener("headerLoaded", initMobileSearchToggle);

    console.log("search.js SINGLE SOURCE OF TRUTH READY");
})();
