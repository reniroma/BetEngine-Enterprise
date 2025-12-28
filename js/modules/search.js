/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE
 * FINAL – DESKTOP SAFE + MOBILE SIBLING OVERLAY
 *
 * GUARANTEES
 * - Desktop search behavior preserved 100%
 * - Mobile search initialized ONLY on open
 * - NO mobile-search-inline dependency
 * - DOM-agnostic, enterprise-safe
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
    }

    /* =========================
       DESKTOP INIT (UNCHANGED)
    ========================= */
    function initDesktopSearch() {
        if (window.matchMedia("(max-width: 900px)").matches) return;
        $$(".be-search").forEach(initSearchRoot);
    }

    document.addEventListener("DOMContentLoaded", initDesktopSearch);
    document.addEventListener("headerLoaded", initDesktopSearch);

    /* =========================
       MOBILE SIBLING OVERLAY
    ========================= */
    function initMobileSearch() {
        const btn   = document.querySelector(".mobile-search-btn");
        const root  = document.querySelector(".be-search");

        if (!btn || !root) return;
        if (root.dataset.mobileBound === "1") return;
        root.dataset.mobileBound = "1";

        function open() {
            document.body.classList.add("mobile-search-open");
            root.hidden = false;
            root.setAttribute("aria-hidden", "false");

            initSearchRoot(root);

            const input = root.querySelector(".be-search-input");
            input && input.focus();
        }

        function close() {
            const input = root.querySelector(".be-search-input");
            if (input && document.activeElement === input) input.blur();

            document.body.classList.remove("mobile-search-open");
            root.hidden = true;
            root.setAttribute("aria-hidden", "true");
        }

        btn.addEventListener("click", (e) => {
            e.preventDefault();
            root.hidden ? open() : close();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !root.hidden) close();
        });
    }

    document.addEventListener("DOMContentLoaded", initMobileSearch);
    document.addEventListener("headerLoaded", initMobileSearch);

    console.log("search.js — OPTION A (Sibling Overlay) READY");
})();
