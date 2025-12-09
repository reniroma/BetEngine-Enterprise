/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL)
 * Loads desktop + mobile + modal header components
 * and dispatches "headerLoaded" when ready.
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {
    async function loadComponent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                return "";
            }
            return await response.text();
        } catch (err) {
            return "";
        }
    }

    const [desktopHeader, mobileHeader, headerModals] = await Promise.all([
        loadComponent("layouts/header/header-desktop.html"),
        loadComponent("layouts/header/header-mobile.html"),
        loadComponent("layouts/header/header-modals.html")
    ]);

    const fullHeader = `${desktopHeader}${mobileHeader}${headerModals}`.trim();
    const mainEl = document.querySelector("main");

    if (mainEl && fullHeader.length > 0) {
        mainEl.insertAdjacentHTML("beforebegin", fullHeader);
        // Notify all UI scripts that header is ready in the DOM
        document.dispatchEvent(new Event("headerLoaded"));
    }
});
