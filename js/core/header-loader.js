/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v9.0 FINAL)
 * Loads:
 *   - Desktop header
 *   - Mobile header
 *   - Header modals (mobile controls)
 *   - Login modal
 *   - Register modal
 *
 * Emits "headerLoaded" when all components are injected.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * BASE PATH AUTO-DETECTION
     *******************************************************/
    function resolveBasePath() {
        const repoSlug = "/BetEngine-Enterprise/";
        const path = window.location.pathname || "/";

        if (path.startsWith(repoSlug)) {
            return repoSlug + "layouts/header/";
        }

        return "/layouts/header/";
    }

    const BASE = resolveBasePath();

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
                console.warn("HeaderLoader v9.0: HTTP error", url, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader v9.0: FETCH FAILED", url, err);
            return "";
        }
    }

    /*******************************************************
     * MAIN INITIALIZER
     *******************************************************/
    async function initHeaderLoader() {
        const mainEl = document.querySelector("main");
        if (!mainEl) {
            console.error("HeaderLoader v9.0: <main> not found.");
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
            console.error("HeaderLoader v9.0: No content loaded.");
            return;
        }

        // Insert BEFORE <main>
        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Dispatch event when everything is ready
        setTimeout(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader v9.0: headerLoaded dispatched", {
                base: BASE,
                files: FILES
            });
        }, 10);
    }

    initHeaderLoader();
});
