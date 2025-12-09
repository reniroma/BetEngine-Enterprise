/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v8.0 FINAL)
 * Auto-detects base path (GitHub Pages, Vercel, local).
 * Injects: desktop header + mobile header + modals.
 * Emits: "headerLoaded" when DOM is fully updated.
 *********************************************************/

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {

        /*******************************************************
         * BASE PATH AUTO-DETECTOR
         *
         * Shembuj typical:
         * - https://reniroma.github.io/BetEngine-Enterprise/
         *   => basePath = "/BetEngine-Enterprise/layouts/header/"
         *
         * - https://betengine.vercel.app/
         *   => basePath = "/layouts/header/"
         *******************************************************/
        function getBasePath() {
            const path = window.location.pathname; // p.sh. "/BetEngine-Enterprise/" ose "/"
            // Marrim vetëm pjesën e parë jo-bosh pas "/"
            const segments = path.split("/").filter(Boolean);

            // Në GitHub Pages segmenti i parë është emri i repos
            // Në Vercel zakonisht nuk ka segment (root)
            let repoSegment = "";
            if (segments.length > 0) {
                repoSegment = "/" + segments[0];
            }

            // Nëse jemi në GitHub Pages (subpath), përdor repoSegment
            // Nëse jemi në root (Vercel, local), repoSegment është bosh
            return (repoSegment ? repoSegment : "") + "/layouts/header/";
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
                    console.warn("HeaderLoader: HTTP", res.status, "for", url);
                    return "";
                }
                return await res.text();
            } catch (err) {
                console.warn("HeaderLoader fetch error:", url, err);
                return "";
            }
        }

        /*******************************************************
         * MAIN INIT
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
                console.error("HeaderLoader: <main> element not found.");
                return;
            }

            if (finalHTML.length === 0) {
                console.error("HeaderLoader: No header content loaded.");
                return;
            }

            // Insert header block above <main>
            mainEl.insertAdjacentHTML("beforebegin", finalHTML);

            // Small delay to ensure DOM is attached and measurable
            setTimeout(() => {
                document.dispatchEvent(new Event("headerLoaded"));
                console.log("HeaderLoader v8.0: headerLoaded event dispatched.");
            }, 10);
        }

        init();
    });
})();
