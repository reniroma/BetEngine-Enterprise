/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (JS ONLY)
 * Isolated behavior with mock data (no API)
 * Features:
 * - Debounced input
 * - Loading / empty / results states
 * - Keyboard navigation (↑ ↓ Enter)
 * - Clear button
 *********************************************************/

(function () {
    "use strict";

    /*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (JS ONLY)
 * Isolated behavior with mock data (no API)
 *********************************************************/

(function () {
    "use strict";

    /* ======================================================
       ENTERPRISE GUARD — HEADER ISOLATION (B-3)
       If header search is active, abort search.js entirely
    ======================================================= */
    if (window.__BE_HEADER_SEARCH_ACTIVE__ === true) {
        console.log("[search.js] Header search active — aborting");
        return;
    }    


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
       DOM REFERENCES
    ======================================================= */
    const root        = $(".be-search");
    if (!root) return;

    const input       = $(".be-search-input", root);
    const clearBtn    = $(".be-search-clear", root);
    const resultsList = $(".be-search-results", root);
    const loadingEl   = $(".be-search-loading", root);
    const emptyEl     = $(".be-search-empty", root);

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
       STATE
    ======================================================= */
    let activeIndex = -1;
    let currentResults = [];

    /* ======================================================
       RENDER HELPERS
    ======================================================= */
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

    /* ======================================================
       SEARCH LOGIC
    ======================================================= */
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

    /* ======================================================
       EVENTS
    ======================================================= */
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
    });

    console.log("search.js READY (isolated)");
})();
