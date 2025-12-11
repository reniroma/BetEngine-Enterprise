/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL v4.0)
 * Loads:
 *   - Desktop header
 *   - Mobile header
 *   - Header modals
 *   - Login modal
 *   - Register modal
 *
 * - Zero HTML in index.html
 * - Fully safe for GitHub Pages, Vercel, Local
 * - Emits "headerLoaded" only after injection completes
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * RELATIVE BASE PATH (Safe in all environments)
     *******************************************************/
    const BASE = "./layouts/header/";

    /*******************************************************
     * COMPONENT FILES
     *******************************************************/
    const FILES = {
        desktop:  BASE + "header-desktop.html",
        mobile:   BASE + "header-mobile.html",
        modals:   BASE + "header-modals.html",
        login:    BASE + "auth-login.html",
        register: BASE + "auth-register.html"
    };

    /*******************************************************
     * FETCH HELPER (Stable — no caching issues)
     *******************************************************/
    async function loadComponent(url) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                console.warn("HeaderLoader: HTTP error", url, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader: FETCH FAILED", url, err);
            return "";
        }
    }

    /*******************************************************
     * MAIN LOADER
     *******************************************************/
    async function initHeaderLoader() {
        const mainEl = document.querySelector("main");

        if (!mainEl) {
            console.error("HeaderLoader: <main> not found.");
            return;
        }

        // Promise.all ensures EVERYTHING is loaded
        const [
            desktopHTML,
            mobileHTML,
            modalsHTML,
            loginHTML,
            registerHTML
        ] = await Promise.all([
            loadComponent(FILES.desktop),
            loadComponent(FILES.mobile),
            loadComponent(FILES.modals),
            loadComponent(FILES.login),
            loadComponent(FILES.register)
        ]);

        const finalHTML =
            `${desktopHTML}\n${mobileHTML}\n${modalsHTML}\n${loginHTML}\n${registerHTML}`.trim();

        if (!finalHTML.length) {
            console.error("HeaderLoader: No header content loaded.");
            return;
        }

        // Insert BEFORE <main>
        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Wait one frame then notify system that header is ready
        requestAnimationFrame(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader: headerLoaded dispatched");
        });
    }

    initHeaderLoader();
});
