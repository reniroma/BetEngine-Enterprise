/*********************************************************
 * BetEngine Enterprise – HEADER SEARCH (FINAL SAFE)
 *********************************************************/
(function () {
    "use strict";

    if (document.querySelector(".header-desktop")) {
        initHeaderSearch();
    } else {
        document.addEventListener("headerLoaded", initHeaderSearch, { once: true });
    }

    function initHeaderSearch() {
        initDesktopSearch();
        initMobileSearch();
        console.log("[HeaderSearch] READY");
    }

    function initDesktopSearch() {
        const input = document.querySelector(".header-desktop .be-search-input");
        const results = document.querySelector(".header-desktop .be-search-results--desktop");

        if (!input || !results) return;

        bind(input, results, "DESKTOP");
    }

    function initMobileSearch() {
        const input = document.querySelector("#mobile-search-modal .be-search-input");
        const results = document.querySelector("#mobile-search-modal .be-search-results");

        if (!input || !results) return;

        bind(input, results, "MOBILE");
    }

    function bind(input, list, ctx) {
        const DATA = [
            "Manchester United",
            "Real Madrid",
            "Bayern Munich",
            "Barcelona",
            "Juventus",
            "Champions League"
        ];

        input.addEventListener("input", () => {
            const q = input.value.toLowerCase().trim();
            list.innerHTML = "";
            if (!q) return;

            DATA.filter(v => v.toLowerCase().includes(q)).forEach(v => {
                const li = document.createElement("li");
                li.textContent = v;
                li.onclick = () => list.innerHTML = "";
                list.appendChild(li);
            });
        });
    }
})();
