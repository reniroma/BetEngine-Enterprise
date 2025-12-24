/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (JS ONLY)
 * Isolated behavior with mock data (no API)
 * FIX:
 * - Initializes AFTER header-loader injection via "headerLoaded"
 * - Supports multiple .be-search roots (desktop + mobile)
 * - Prevents double-binding per root
 *********************************************************/

(function () {
    "use strict";

   /* ======================================================
       LOCAL HELPERS (NO GLOBALS)
    ======================================================= */
    const $  = (sel, scope = document) => scope.querySelector(sel);
    const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const debounce = (fn, delay = 300) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(null, args), delay);
        };
    };

    /* ======================================================
       MOCK DATA (SAFE)
    ======================================================= */
    const MOCK_DATA = [
        { type: "Team",   title: "Manchester United", meta: "England · Premier League" },
        { type: "Team",   title: "Real Madrid",       meta: "Spain · La Liga" },
        { type: "Team",   title: "Bayern Munich",     meta: "Germany · Bundesliga" },
        { type: "Player", title: "Lionel Messi",      meta: "Inter Miami · Forward" },
        { type: "Player", title: "Cristiano Ronaldo", meta: "Al Nassr · Forward" },
        { type: "League", title: "Premier League",    meta: "England" },
        { type: "League", title: "Champions League",  meta: "UEFA" }
    ];

    /* ======================================================
       INIT PER ROOT (.be-search)
    ======================================================= */
    function initSearchRoot(root) {
        if (!root || root.dataset.beSearchInit === "1") return;

        const input       = $(".be-search-input", root);
        const clearBtn    = $(".be-search-clear", root);
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
        }

        function renderResults(items) {
            clearResults();

            items.forEach((item, idx) => {
                const li = document.createElement("li");
                li.className = "be-search-result";
                li.setAttribute("role", "option");
                li.dataset.index = String(idx);

                li.innerHTML = `
                    <span class="be-search-result-icon">${item.type[0]}</span>
                    <div class="be-search-result-content">
                        <div class="be-search-result-title">${item.title}</div>
                        <div class="be-search-result-meta">${item.meta}</div>
                    </div>
                `;

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
            }, 250);
        }

        const debouncedSearch = debounce((value) => {
            if (!value.trim()) {
                showLoading(false);
                showEmpty(false);
                clearResults();
                clearBtn.hidden = true;
                return;
            }

            clearBtn.hidden = false;
            performSearch(value);
        }, 300);

        input.addEventListener("input", (e) => {
            debouncedSearch(e.target.value);
        });

        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.hidden = true;
            showLoading(false);
            showEmpty(false);
            clearResults();
            input.focus();
        });

        input.addEventListener("keydown", (e) => {
            const itemsCount = currentResults.length;
            if (!itemsCount) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((activeIndex + 1) % itemsCount);
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((activeIndex - 1 + itemsCount) % itemsCount);
            }

            if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                selectIndex(activeIndex);
            }
       
    // =======================================
// DESKTOP SAFE CLOSE ON FOCUS OUT (NO RISK)
// =======================================
input.addEventListener("blur", () => {
    requestAnimationFrame(() => {
        if (!root.contains(document.activeElement)) {
            resultsList.setAttribute("hidden", "");
            activeIndex = -1;
        }
    });
});

    function initAllSearch() {
        const roots = $$(".be-search");
        if (!roots.length) return;
        roots.forEach(initSearchRoot);
    }

    /* ======================================================
       INIT TRIGGERS (GUARDED)
       - DOMContentLoaded: if header is already in DOM
       - headerLoaded: for header-loader injected DOM
    ======================================================= */
    document.addEventListener("DOMContentLoaded", initAllSearch);
    document.addEventListener("headerLoaded", initAllSearch);

    // Fallback: if header-loader already flagged readiness
    if (window.__BE_HEADER_READY__ === true) {
        initAllSearch();
    }

    console.log("search.js READY (init via DOMContentLoaded/headerLoaded)");
})();
