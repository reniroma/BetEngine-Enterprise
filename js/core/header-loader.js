/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v9.0 FINAL)
 * Adds support for 2 standalone auth modals:
 * login-modal.html + register-modal.html
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------
       BASE PATH AUTO-DETECTION
    ------------------------------------------------ */
    function resolveBasePath() {
        const repoSlug = "/BetEngine-Enterprise/";
        const path = window.location.pathname || "/";

        return path.startsWith(repoSlug)
            ? repoSlug + "layouts/header/"
            : "/layouts/header/";
    }

    const BASE = resolveBasePath();

    /* -----------------------------------------------
       FILES TO LOAD
    ------------------------------------------------ */
    const FILES = {
        desktop:        BASE + "header-desktop.html",
        mobile:         BASE + "header-mobile.html",
        modals:         BASE + "header-modals.html",       // mobile odds/lang/tools
        login:          BASE + "login-modal.html",
        register:       BASE + "register-modal.html"
    };

    /* -----------------------------------------------
       FETCH HELPER
    ------------------------------------------------ */
    async function loadComponent(url) {
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                console.warn("HeaderLoader v9: HTTP error", url, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader v9: fetch error", url, err);
            return "";
        }
    }

    /* -----------------------------------------------
       MAIN INITIALIZER
    ------------------------------------------------ */
    async function initHeaderLoader() {
        const mainEl = document.querySelector("main");
        if (!mainEl) {
            console.error("HeaderLoader v9: <main> not found.");
            return;
        }

        // Load ALL 5 components
        const [
            desktopHTML,
            mobileHTML,
            modalHTML,
            loginHTML,
            registerHTML
        ] = await Promise.all([
            loadComponent(FILES.desktop),
            loadComponent(FILES.mobile),
            loadComponent(FILES.modals),
            loadComponent(FILES.login),
            loadComponent(FILES.register)
        ]);

        const finalHTML = `
${desktopHTML}
${mobileHTML}
${modalHTML}
${loginHTML}
${registerHTML}
        `.trim();

        if (!finalHTML) {
            console.error("HeaderLoader v9: No content loaded.");
            return;
        }

        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Allow DOM to settle
        setTimeout(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader v9 loaded:", FILES);
        }, 10);
    }

    initHeaderLoader();
});
