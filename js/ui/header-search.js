/*********************************************************
 * BetEngine Enterprise – HEADER SEARCH (DESKTOP + MOBILE)
 * Isolated from page search.js
 * Safe, deterministic, no globals
 *********************************************************/

(function () {
    "use strict";

    /* ===============================
       MOCK DATA (TEMP / SAFE)
    =============================== */
    const DATA = [
        { type: "Team", title: "Manchester United", meta: "England · Premier League" },
        { type: "Team", title: "Real Madrid", meta: "Spain · La Liga" },
        { type: "Team", title: "Bayern Munich", meta: "Germany · Bundesliga" },
        { type: "Player", title: "Lionel Messi", meta: "Inter Miami · Forward" },
        { type: "Player", title: "Cristiano Ronaldo", meta: "Al Nassr · Forward" },
        { type: "League", title: "Premier League", meta: "England" },
        { type: "League", title: "Champions League", meta: "UEFA" }
    ];

    /* ===============================
       UTIL
    =============================== */
    const debounce = (fn, delay = 300) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    };

    /* ===============================
       CORE SEARCH LOGIC (REUSABLE)
    =============================== */
    function bindSearch(input, results) {
        if (!input || !results) return;

        let activeIndex = -1;
        let current = [];

        const clear = () => {
            results.innerHTML = "";
            current = [];
            activeIndex = -1;
        };

        const render = (items) => {
            clear();
            items.forEach((item, i) => {
                const li = document.createElement("li");
                li.className = "be-search-result";
                li.setAttribute("role", "option");
                li.innerHTML = `
                    <span class="be-search-result-icon">${item.type[0]}</span>
                    <div class="be-search-result-content">
                        <div class="be-search-result-title">${item.title}</div>
                        <div class="be-search-result-meta">${item.meta}</div>
                    </div>
                `;
                li.addEventListener("click", () => {
                    console.log("[HEADER SEARCH]", item);
                });
                results.appendChild(li);
            });
            current = items;
        };

        const search = debounce((value) => {
            const q = value.trim().toLowerCase();
            if (!q) {
                clear();
                return;
            }

            const matches = DATA.filter(x =>
                x.title.toLowerCase().includes(q)
            );

            render(matches);
        }, 300);

        input.addEventListener("input", e => search(e.target.value));

        input.addEventListener("keydown", e => {
            if (!current.length) return;

            const items = results.querySelectorAll(".be-search-result");

            if (e.key === "ArrowDown") {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
            }

            if (e.key === "Enter" && activeIndex >= 0) {
                e.preventDefault();
                console.log("[HEADER SEARCH]", current[activeIndex]);
            }

            items.forEach(el => el.classList.remove("is-active"));
            if (items[activeIndex]) {
                items[activeIndex].classList.add("is-active");
            }
        });
    }

    /* ===============================
       DESKTOP BINDING
    =============================== */
    function initDesktop() {
        const input   = document.querySelector(".header-desktop .be-search-input");
        const results = document.querySelector(".header-desktop .be-search-results--desktop");
        bindSearch(input, results);
    }

    /* ===============================
       MOBILE BINDING
    =============================== */
    function initMobile() {
        const modal = document.querySelector("#mobile-search-modal");
        if (!modal) return;

        let input   = modal.querySelector("input[type='search']");
        let results = modal.querySelector(".be-search-results");

        if (!results) {
            results = document.createElement("ul");
            results.className = "be-search-results";
            results.setAttribute("role", "listbox");
            modal.querySelector(".be-modal-body").appendChild(results);
        }

        bindSearch(input, results);
    }

    /* ===============================
       INIT (AFTER HEADER LOADED)
    =============================== */
    document.addEventListener("headerLoaded", () => {
        initDesktop();
        initMobile();
        console.log("HEADER_SEARCH_READY");
    });

})();
