/*********************************************************
 * BetEngine Enterprise – SEARCH MODULE (FINAL)
 * Single source of truth for Desktop + Mobile search
 * Scope: ONLY elements inside each .be-search root
 * No global listeners, no side effects
 *********************************************************/
(() => {
    "use strict";

    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
    const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

    /* =========================================
       MOCK DATA (PLACEHOLDER)
       Replace with API later without changing UI
    ========================================= */
    const DATA = [
        { type: "Team", name: "Manchester United", meta: "England · Premier League" },
        { type: "Team", name: "Real Madrid", meta: "Spain · La Liga" },
        { type: "League", name: "Premier League", meta: "England" },
        { type: "League", name: "La Liga", meta: "Spain" },
        { type: "Competition", name: "UEFA Champions League", meta: "Europe" },
    ];

    function initSearchInstance(root) {
        const input       = qs(".be-search-input", root);
        const clearBtn    = qs(".be-search-clear", root);
        const resultsList = qs(".be-search-results", root);
        const loadingEl   = qs(".be-search-loading", root);
        const emptyEl     = qs(".be-search-empty", root);

        if (!input || !clearBtn || !resultsList || !loadingEl || !emptyEl) return;

        let currentResults = [];
        let activeIndex = -1;

        const showEl = (el) => el && el.classList.add("is-visible");
        const hideEl = (el) => el && el.classList.remove("is-visible");

        const closePanel = () => {
            hideEl(resultsList);
            hideEl(loadingEl);
            hideEl(emptyEl);
            activeIndex = -1;
        };

        const openPanel = () => {
            if (!input.value.trim()) {
                closePanel();
                return;
            }
            showEl(resultsList);
        };

        const setActive = (idx) => {
            activeIndex = idx;
            qsa("li", resultsList).forEach((li, i) => {
                li.classList.toggle("active", i === idx);
            });
        };

        const renderResults = (items) => {
            resultsList.innerHTML = "";

            items.forEach((item) => {
                const li = document.createElement("li");
                li.className = "be-search-result";

                li.innerHTML = `
                    <div class="be-search-icon">${item.type.slice(0, 1)}</div>
                    <div class="be-search-text">
                        <div class="be-search-name">${item.name}</div>
                        <div class="be-search-meta">${item.meta}</div>
                    </div>
                `;

                on(li, "click", () => {
                    input.value = item.name;
                    closePanel();
                });

                resultsList.appendChild(li);
            });

            showEl(resultsList);
        };

        const runSearch = (query) => {
            const q = query.trim().toLowerCase();
            if (!q) {
                closePanel();
                return;
            }

            showEl(loadingEl);
            hideEl(resultsList);
            hideEl(emptyEl);

            window.setTimeout(() => {
                currentResults = DATA.filter((x) =>
                    x.name.toLowerCase().includes(q) || x.meta.toLowerCase().includes(q)
                );

                hideEl(loadingEl);

                if (!currentResults.length) {
                    hideEl(resultsList);
                    showEl(emptyEl);
                    return;
                }

                hideEl(emptyEl);
                renderResults(currentResults);
                setActive(-1);
            }, 140);
        };

        /* =========================
           EVENTS (SCOPED)
        ========================= */
        on(input, "input", () => runSearch(input.value));
        on(input, "focus", () => openPanel());

        on(clearBtn, "click", () => {
            input.value = "";
            input.focus();
            closePanel();
        });

        on(input, "keydown", (e) => {
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
                const item = currentResults[activeIndex];
                if (!item) return;
                input.value = item.name;
                closePanel();
            }

            if (e.key === "Escape") {
                closePanel();
                input.blur();
            }
        });
    }

    function initMobileSearchModalTrigger() {
        const trigger = qs(".mobile-search-btn");
        const overlay = qs("#mobile-search-modal");
        if (!trigger || !overlay) return;

        const modalInput = qs(".be-search-input", overlay);
        const closeBtn = qs("#mobile-search-modal .be-modal-close");

        const open = () => {
            overlay.classList.add("show");
            if (modalInput) modalInput.focus();
        };

        const close = () => {
            overlay.classList.remove("show");
        };

        on(trigger, "click", open);
        on(closeBtn, "click", close);

        on(overlay, "click", (e) => {
            if (e.target === overlay) close();
        });
    }

    const roots = qsa(".be-search");
    if (!roots.length) return;

    roots.forEach(initSearchInstance);
    initMobileSearchModalTrigger();

    console.log("search.js READY (isolated)");
})();
