/*********************************************************
 * BetEngine Enterprise – HEADER SEARCH
 * Desktop + Mobile binding
 * Triggered ONLY after headerLoaded
 *********************************************************/
(function () {
    "use strict";

    /* ======================================================
       SAFE INIT AFTER HEADER INJECTION
    ======================================================= */
    document.addEventListener("headerLoaded", initHeaderSearch);

    function initHeaderSearch() {
        initDesktopSearch();
        initMobileSearch();
        console.log("[HeaderSearch] READY");
    }

    /* ======================================================
       DESKTOP SEARCH
    ======================================================= */
    function initDesktopSearch() {
        const input = document.querySelector(
            ".header-desktop .be-search-input"
        );
        const results = document.querySelector(
            ".header-desktop .be-search-results--desktop"
        );

        if (!input || !results) {
            console.warn("[HeaderSearch] Desktop search not found");
            return;
        }

        bindSearchLogic(input, results, "DESKTOP");
    }

    /* ======================================================
       MOBILE SEARCH
    ======================================================= */
    function initMobileSearch() {
        const input = document.querySelector(
            "#mobile-search-modal .be-search-input"
        );
        const results = document.querySelector(
            "#mobile-search-modal .be-search-results"
        );

        if (!input || !results) {
            console.warn("[HeaderSearch] Mobile search not found");
            return;
        }

        bindSearchLogic(input, results, "MOBILE");
    }

    /* ======================================================
       SHARED SEARCH LOGIC (MOCK)
    ======================================================= */
    function bindSearchLogic(input, resultsList, context) {
        const DATA = [
            "Manchester United",
            "Real Madrid",
            "Bayern Munich",
            "Barcelona",
            "Liverpool",
            "Juventus",
            "PSG",
            "Champions League",
            "Premier League"
        ];

        input.addEventListener("input", () => {
            const q = input.value.trim().toLowerCase();
            resultsList.innerHTML = "";

            if (!q) return;

            const matches = DATA.filter(item =>
                item.toLowerCase().includes(q)
            );

            matches.forEach(text => {
                const li = document.createElement("li");
                li.className = "be-search-result";
                li.textContent = text;
                li.addEventListener("click", () => {
                    console.log(`[Search:${context}] Selected`, text);
                    resultsList.innerHTML = "";
                });
                resultsList.appendChild(li);
            });
        });
    }
})();
