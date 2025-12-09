/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v8.1 FINAL)
 * Auto-detects base path (GitHub Pages, Vercel, local).
 * Injects desktop header, mobile header, and modal blocks.
 * Emits "headerLoaded" when DOM is fully updated.
 *********************************************************/

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /*******************************************************
         * BASE PATH AUTO-DETECTION
         * - GitHub Pages example:
         *   https://domain.github.io/RepoName/  => "/RepoName/layouts/header/"
         * - Vercel / Local example:
         *   https://project.vercel.app/         => "/layouts/header/"
         *******************************************************/
        function getBasePath() {
            const path = window.location.pathname;
            const segments = path.split("/").filter(Boolean);

            // GitHub Pages → first segment is repo name
            // Vercel / Local → no repo folder (root)
            const repo = segments.length > 0 ? "/" + segments[0] : "";

            return (repo ? repo : "") + "/layouts/header/";
        }

        const BASE = getBasePath();

        const FILES = {
            desktop: BASE + "header-desktop.html",
            mobile:  BASE + "header-mobile.html",
            modals:  BASE + "header-modals.html"
        };

        /*******************************************************
         * FETCH HELPER
         *******************************************************/
        async function loadComponent(url) {
            try {
                const res = await fetch(url, { cache: "no-store" });
                if (!res.ok) {
                    console.warn("HeaderLoader: HTTP error", res.status, url);
                    return "";
                }
                return await res.text();
            } catch (err) {
                console.warn("HeaderLoader fetch failed:", url, err);
                return "";
            }
        }

        /*******************************************************
         * MAIN INITIALIZATION
         *******************************************************/
        async function init() {
            const [desktop, mobile, modals] = await Promise.all([
                loadComponent(FILES.desktop),
                loadComponent(FILES.mobile),
                loadComponent(FILES.modals)
            ]);

            const finalHTML = `${desktop}\n${mobile}\n${modals}`.trim();
            const mainEl = document.querySelector("main");

            if (!mainEl) {
                console.error("HeaderLoader: <main> not found.");
                return;
            }

            if (finalHTML.length === 0) {
                console.error("HeaderLoader: No header components loaded.");
                return;
            }

            // Inject the full header block above <main>
            mainEl.insertAdjacentHTML("beforebegin", finalHTML);

            setTimeout(() => {
                document.dispatchEvent(new Event("headerLoaded"));
                console.log("HeaderLoader v8.1: headerLoaded event dispatched.");
            }, 10);
        }

        init();
    });
})();
