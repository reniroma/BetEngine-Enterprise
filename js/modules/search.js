/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE
 * FINAL – MOBILE SAFE (DIRECT BUTTON BINDING)
 *
 * GUARANTEES
 * - header-mobile.js is NOT touched
 * - hamburger & bookmarks remain intact
 * - mobile search handled ONLY here
 * - desktop search behavior preserved
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
       SEARCH CORE (DESKTOP + MOBILE)
    ========================= */
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

            input.value = "";
            clearBtn.hidden = true;
            clearResults();
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
                showLoading(false);
                showEmpty(false);
                clearResults();
                clearBtn.hidden = true;
                return;
            }

            clearBtn.hidden = false;
            performSearch(value);
        }, 250);

        input.addEventListener("input", e => {
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
        });

        document.addEventListener("mousedown", e => {
            if (root.contains(e.target)) return;
            input.value = "";
            clearBtn.hidden = true;
            clearResults();
        });
    }

    function initAllSearch() {
        $$(".be-search").forEach(initSearchRoot);
    }

    document.addEventListener("DOMContentLoaded", initAllSearch);
    document.addEventListener("headerLoaded", initAllSearch);

    /* =========================
       MOBILE SEARCH – DIRECT BUTTON (SAFE)
    ========================= */
    function initMobileSearchStandalone() {
        const btn   = document.querySelector(".mobile-search-btn");
        const panel = document.querySelector(".mobile-search-inline");

        if (!btn || !panel) return;

        btn.addEventListener("click", (e) => {
            e.preventDefault();

            const isHidden = panel.hasAttribute("hidden");

            if (isHidden) {
                panel.removeAttribute("hidden");
                const input = panel.querySelector(".be-search-input");
                if (input) input.focus();
            } else {
                panel.setAttribute("hidden", "");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", initMobileSearchStandalone);
    document.addEventListener("headerLoaded", initMobileSearchStandalone);

    console.log("search.js STANDALONE MOBILE SAFE READY");
})();
