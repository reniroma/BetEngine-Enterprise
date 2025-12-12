/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL v2.0)
 * FIXED:
 * - Guaranteed DOM injection order
 * - headerLoaded fires ONCE and ONLY when safe
 * - Prevents race conditions with header.js / header-mobile.js / auth
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    const BASE_PATH = "layouts/header/";

    const FILES = [
        "header-desktop.html",
        "header-mobile.html",
        "header-modals.html",
        "auth-login.html",
        "auth-register.html"
    ];

    let headerLoadedOnce = false;

    async function fetchHTML(path) {
        try {
            const res = await fetch(path, { cache: "no-store" });
            if (!res.ok) {
                console.error("[HeaderLoader] Failed:", path, res.status);
                return "";
            }
            return await res.text();
        } catch (err) {
            console.error("[HeaderLoader] Fetch error:", path, err);
            return "";
        }
    }

    const main = document.querySelector("main");
    if (!main) {
        console.error("[HeaderLoader] <main> not found");
        return;
    }

    const fragments = [];

    for (const file of FILES) {
        const html = await fetchHTML(BASE_PATH + file);
        if (html && html.trim()) {
            fragments.push(html.trim());
        }
    }

    if (!fragments.length) {
        console.error("[HeaderLoader] No header HTML loaded");
        return;
    }

    // Inject ALL header HTML before <main>
    main.insertAdjacentHTML("beforebegin", fragments.join("\n"));

    /* ====================================================
       FINAL SAFE DISPATCH
    ==================================================== */
    const fireHeaderLoaded = () => {
        if (headerLoadedOnce) return;
        headerLoadedOnce = true;
        document.dispatchEvent(new Event("headerLoaded"));
        console.log("[HeaderLoader] headerLoaded dispatched (SAFE)");
    };

    // Double safety: DOM + microtask + next frame
    setTimeout(() => {
        requestAnimationFrame(() => {
            fireHeaderLoaded();
        });
    }, 0);
});
