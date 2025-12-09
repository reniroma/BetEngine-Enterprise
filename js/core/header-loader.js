/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (v8.0 FINAL)
 * Auto-detect base path for GitHub Pages, Vercel, localhost.
 * Injects: desktop header + mobile header + modals.
 * Emits: "headerLoaded" when header markup is ready.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * BASE PATH AUTO-DETECTION
     *
     * Rules:
     * - If running under GitHub Pages repository
     *     → URL contains "/BetEngine-Enterprise/"
     *     → base = "/BetEngine-Enterprise/layouts/header/"
     *
     * - Else (Vercel / localhost / any root-hosted build)
     *     → base = "/layouts/header/"
     *******************************************************/
    function resolveBasePath() {
        const repoSlug = "/BetEngine-Enterprise/";
        const path = window.location.pathname || "/";

        if (path.startsWith(repoSlug)) {
            // GitHub Pages (or any host with this prefix)
            return repoSlug + "layouts/header/";
        }

        // Root-hosted (Vercel, localhost, etc.)
        return "/layouts/header/";
    }

    const BASE = resolveBasePath();

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
                console.warn("HeaderLoader v8.0: HTTP error for", url, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.warn("HeaderLoader v8.0: fetch error for", url, err);
            return "";
        }
    }

    /*******************************************************
     * MAIN INITIALIZER
     *******************************************************/
    async function initHeaderLoader() {
        const mainEl = document.querySelector("main");
        if (!mainEl) {
            console.error("HeaderLoader v8.0: <main> element not found.");
            return;
        }

        const [desktopHTML, mobileHTML, modalsHTML] = await Promise.all([
            loadComponent(FILES.desktop),
            loadComponent(FILES.mobile),
            loadComponent(FILES.modals)
        ]);

        const finalHTML = `${desktopHTML}\n${mobileHTML}\n${modalsHTML}`.trim();

        if (!finalHTML) {
            console.error("HeaderLoader v8.0: no header content loaded.");
            return;
        }

        // Inject header block just before <main>
        mainEl.insertAdjacentHTML("beforebegin", finalHTML);

        // Small delay to ensure DOM is fully attached
        setTimeout(() => {
            document.dispatchEvent(new Event("headerLoaded"));
            console.log("HeaderLoader v8.0: headerLoaded event dispatched.", {
                base: BASE,
                files: FILES
            });
        }, 10);
    }

    initHeaderLoader();
});
