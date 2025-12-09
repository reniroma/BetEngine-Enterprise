/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v5.0 FINAL)
 * Stable path-loading for GitHub Pages + Enterprise DOM sync
 * Loads desktop + mobile + modals and fires "headerLoaded"
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    /*******************************************************
     * SAFE COMPONENT FETCHER (GitHub Pages Compatible)
     *******************************************************/
    async function loadComponent(path) {
        try {
            const response = await fetch(path + "?v=" + Date.now()); // cache-bust
            if (!response.ok) return "";
            return await response.text();
        } catch (err) {
            console.warn("HeaderLoader: failed to load", path, err);
            return "";
        }
    }

    /*******************************************************
     * REAL PATHS (AS GIVEN BY USER)
     *******************************************************/
    const ROOT = "BetEngine-Enterprise/layouts/header/";

    const desktopPath = ROOT + "header-desktop.html";
    const mobilePath  = ROOT + "header-mobile.html";
    const modalsPath  = ROOT + "header-modals.html";

    /*******************************************************
     * LOAD ALL COMPONENTS IN PARALLEL
     *******************************************************/
    const [desktopHTML, mobileHTML, modalsHTML] = await Promise.all([
        loadComponent(desktopPath),
        loadComponent(mobilePath),
        loadComponent(modalsPath)
    ]);

    const finalHeader = `${desktopHTML}${mobileHTML}${modalsHTML}`.trim();

    /*******************************************************
     * INSERT HEADER BEFORE <main>
     *******************************************************/
    const mainEl = document.querySelector("main");

    if (finalHeader.length > 0 && mainEl) {
        mainEl.insertAdjacentHTML("beforebegin", finalHeader);

        // Dispatch only AFTER header is fully attached
        document.dispatchEvent(new Event("headerLoaded"));

        console.log("%cHeaderLoader v5.0 → headerLoaded dispatched",
            "color:#00eaff;font-weight:bold;");
    } else {
        console.error("HeaderLoader v5.0 → Header failed to load or <main> missing.");
    }
});
