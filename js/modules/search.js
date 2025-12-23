/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (DESKTOP PATCH 1/3)
 * Desktop-only binding to header search input
 * - No HTML/CSS changes
 * - No globals
 * - Mobile untouched
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
       ROOT DETECTION (ENTERPRISE FALLBACK)
       Priority:
       1) .be-search (page module)
       2) Desktop header .search-box
    ======================================================= */
    const root =
        document.querySelector(".be-search") ||
        document.querySelector(".header-desktop .search-box");

    if (!root) return; // nothing to bind

    /* ======================================================
       DESKTOP GUARD (DO NOT TOUCH MOBILE)
    ======================================================= */
    const isDesktopContext = !!document.querySelector(".header-desktop .search-box");
    if (!isDesktopContext) return;

    /* ======================================================
       INPUT DETECTION (DESKTOP HEADER)
    ======================================================= */
    const input = root.querySelector("input[type='search']");
    if (!input) return;

    /* ======================================================
       RESULTS CONTAINER (DESKTOP-ONLY, INJECTED)
    ======================================================= */
    let resultsList = root.querySelector(".be-search-results--desktop");

    if (!resultsList) {
        resultsList = document.createElement("ul");
        resultsList.className = "be-search-results be-search-results--desktop";
        resultsList.setAttribute("role", "listbox");

        // Insert results just after the search box
        root.appendChild(resultsList);
    }

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
        // Placeholder action for desktop test
        console.log("[DESKTOP SEARCH] Selected:", item);
        clearResults();
    }

    /* ======================================================
       SEARCH LOGIC (DESKTOP)
    ======================================================= */
    function performSearch(query) {
        clearResults();

        const q = query.toLowerCase();
        const matches = MOCK_DATA.filter(item =>
            item.title.toLowerCase().includes(q)
        );

        if (!matches.length) return;
        renderResults(matches);
    }

    const debouncedSearch = debounce((value) => {
        if (!value.trim()) {
            clearResults();
            return;
        }
        performSearch(value);
    }, 300);

    /* ======================================================
       EVENTS (DESKTOP INPUT ONLY)
    ======================================================= */
    input.addEventListener("input", (e) => {
        debouncedSearch(e.target.value);
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

    // Close results when clicking outside the search box
    document.addEventListener("click", (e) => {
        if (!root.contains(e.target)) clearResults();
    });

    console.log("DESKTOP search.js READY (PATCH 1/3)");
})();
