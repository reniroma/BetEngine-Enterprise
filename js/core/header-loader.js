/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v7.0 FINAL)
 * Absolute-path loader for GitHub Pages & Enterprise builds.
 * Injects: desktop header + mobile header + modals.
 * Emits: "headerLoaded" when DOM is fully updated.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * ABSOLUTE BASE PATH FOR GITHUB PAGES
     *******************************************************/
    const BASE = "/BetEngine-Enterprise/layouts/header/";

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
            if (!res.ok) return "";
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader fetch error:", url, err);
            return "";
        }
    }

    /*******************************************************
     * LOAD ALL COMPONENTS
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

        if (finalHTML.length > 0) {
            // Insert header block above <main>
            mainEl.insertAdjacentHTML("beforebegin", finalHTML);

            // Wait a short delay to ensure DOM attachment is stable
            setTimeout(() => {
                document.dispatchEvent(new Event("headerLoaded"));
                console.log("HeaderLoader v7.0: headerLoaded event dispatched.");
            }, 10);
        } else {
            console.error("HeaderLoader: No header content loaded.");
        }
    }

    init();
});
