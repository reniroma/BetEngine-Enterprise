/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v10 FINAL)
 * Universal Relative Path Version
 * Loads:
 *   - Desktop header
 *   - Mobile header
 *   - Header modals
 *   - Login modal
 *   - Register modal
 *
 * Emits "headerLoaded" after successful insertion.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * RELATIVE BASE PATH (Always safe)
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
     * FETCH HELPER
     *******************************************************/
    async function loadComponent(url) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                console.warn("HeaderLoader v10: HTTP error", url, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader v10: FETCH FAILED", url, err);
            return "";
        }
    }

    /*******************************************************
     * MAIN LOADER
     *******************************************************/
    async function initHeaderLoader() {
        const mainEl = document.querySelector("main");
        if (!mainEl) {
            console.error("HeaderLoader v10: <main> not found.");
            return;
        }

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

        if (!finalHTML) {
            console.error("HeaderLoader v10: No content loaded.");
            return;
        }

        // Insert BEFORE <main>
        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Dispatch event after DOM is updated
        setTimeout(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader v10: headerLoaded dispatched");
        }, 20);
    }

    initHeaderLoader();
});
