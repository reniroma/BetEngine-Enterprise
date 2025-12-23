/*********************************************************
 * BetEngine Enterprise – HEADER SEARCH (FINAL v1.0)
 * Scope:
 * - Desktop header inline search
 * - Mobile search modal
 * - NO dependency on search.js
 * - Safe with headerLoaded
 *********************************************************/

(function () {
    "use strict";

    /* ===============================================
       INIT CONTROL
    =============================================== */
    if (window.__BE_HEADER_READY__ === true) {
        init();
    } else {
        document.addEventListener("headerLoaded", init, { once: true });
    }

    function init() {
        initDesktop();
        initMobile();
        console.log("[HeaderSearch] initialized");
    }

    /* ===============================================
       SHARED DATA (TEMP / MOCK)
    =============================================== */
    const DATA = [
        "Manchester United",
        "Real Madrid",
        "Barcelona",
        "Bayern Munich",
        "Juventus",
        "Paris Saint-Germain",
        "Champions League",
        "Premier League",
        "La Liga",
        "Bundesliga"
    ];

    /* ===============================================
       DESKTOP SEARCH
    =============================================== */
    function initDesktop() {
        const input = document.querySelector(
            ".header-desktop .be-search-input"
        );
        const list = document.querySelector(
            ".header-desktop .be-search-results--desktop"
        );

        if (!input || !list) {
            console.warn("[HeaderSearch] desktop elements missing");
            return;
        }

        bindSearch(input, list, "DESKTOP");
    }

    /* ===============================================
       MOBILE SEARCH (MODAL)
    =============================================== */
    function initMobile() {
        const modal = document.querySelector("#mobile-search-modal");
        if (!modal) return;

        const input = modal.querySelector(".be-search-input");
        const list  = modal.querySelector(".be-search-results");

        if (!input || !list) {
            console.warn("[HeaderSearch] mobile elements missing");
            return;
        }

        bindSearch(input, list, "MOBILE");
    }

    /* ===============================================
       CORE BINDING
    =============================================== */
    function bindSearch(input, list, ctx) {
        let timer = null;

        input.addEventListener("input", () => {
            clearTimeout(timer);

            timer = setTimeout(() => {
                const q = input.value.trim().toLowerCase();
                list.innerHTML = "";

                if (!q) return;

                DATA
                    .filter(v => v.toLowerCase().includes(q))
                    .forEach(v => {
                        const li = document.createElement("li");
                        li.className = "be-search-result";
                        li.textContent = v;

                        li.addEventListener("click", () => {
                            input.value = v;
                            list.innerHTML = "";
                        });

                        list.appendChild(li);
                    });
            }, 200);
        });

        // ESC clears results
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                list.innerHTML = "";
                input.blur();
            }
        });
    }

})();
