/*********************************************************
 * BetEngine Enterprise – HEADER LOADER
 * Loads desktop + mobile + modal header components
 * Automatically injected before <main> for all pages.
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    async function loadComponent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) return "";
            return await response.text();
        } catch (err) {
            return "";
        }
    }

    const desktopHeader = await loadComponent("layouts/header/header-desktop.html");
    const mobileHeader  = await loadComponent("layouts/header/header-mobile.html");
    const headerModals  = await loadComponent("layouts/header/header-modals.html");

    const fullHeader = desktopHeader + mobileHeader + headerModals;

    const mainEl = document.querySelector("main");

    if (mainEl && fullHeader.trim().length > 0) {
        mainEl.insertAdjacentHTML("beforebegin", fullHeader);
    }
});
