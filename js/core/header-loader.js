/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL, STABLE)
 * - Injects: desktop header, mobile header, header modals,
 *   auth login + auth register
 * - SINGLE source of header HTML
 * - Emits "headerLoaded" ONCE, only after DOM injection
 * - Compatible with:
 *   header.js
 *   header-mobile.js
 *   header-auth.js
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    /* ====================================================
       CONFIG
    ==================================================== */
    const BASE_PATH = "layouts/header/";

    const FILES = [
        "header-desktop.html",
        "header-mobile.html",
        "header-modals.html",
        "auth-login.html",
        "auth-register.html"
    ];

    /* ====================================================
       SAFE FETCH
    ==================================================== */
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

    /* ====================================================
       LOAD & INJECT
    ==================================================== */
    const mainEl = document.querySelector("main");

    if (!mainEl) {
        console.error("[HeaderLoader] <main> not found. Abort.");
        return;
    }

    const htmlParts = [];

    for (const file of FILES) {
        const html = await fetchHTML(BASE_PATH + file);
        if (html.trim().length) {
            htmlParts.push(html.trim());
        }
    }

    if (!htmlParts.length) {
        console.error("[HeaderLoader] No header HTML loaded.");
        return;
    }

    // Inject everything BEFORE <main>
    mainEl.insertAdjacentHTML("beforebegin", htmlParts.join("\n"));

    /* ====================================================
       FINALIZE
    ==================================================== */
    requestAnimationFrame(() => {
        document.dispatchEvent(new Event("headerLoaded"));
        console.log("[HeaderLoader] headerLoaded dispatched");
    });

});
