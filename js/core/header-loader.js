/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v7.1 ULTRA-STABLE)
 * Safe loader for GitHub Pages project repositories.
 * Loads desktop + mobile + modals with fallback mode.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * RELATIVE BASE PATH (FIX FOR GITHUB PAGES)
     *******************************************************/
    const BASE = "layouts/header/";

    const FILES = {
        desktop: BASE + "header-desktop.html",
        mobile:  BASE + "header-mobile.html",
        modals:  BASE + "header-modals.html"
    };

    /*******************************************************
     * FETCH HELPER – NEVER BREAK
     *******************************************************/
    async function loadComponent(url) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) return "";
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader fetch error:", url);
            return "";
        }
    }

    /*******************************************************
     * INIT LOADER
     *******************************************************/
    async function init() {
        const desktop = await loadComponent(FILES.desktop);
        const mobile  = await loadComponent(FILES.mobile);
        const modals  = await loadComponent(FILES.modals);

        // Build header – even partial load is allowed
        const finalHTML = `
            ${desktop || ""}
            ${mobile  || ""}
            ${modals  || ""}
        `.trim();

        const mainEl = document.querySelector("main");
        if (!mainEl) {
            console.error("HeaderLoader: <main> not found.");
            return;
        }

        // Inject header ALWAYS
        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Dispatch event
        setTimeout(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader v7.1: headerLoaded event dispatched.");
        }, 10);
    }

    init();
});
