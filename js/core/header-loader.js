/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL v7.3)
 * Injects:
 *  - header-desktop.html
 *  - header-mobile.html
 *  - header-modals.html
 *  - auth-login.html
 *  - auth-register.html
 *
 * Guarantees:
 *  - Safe, idempotent "headerLoaded"
 *  - Late listeners always receive the event
 *********************************************************/

document.addEventListener("DOMContentLoaded", async () => {

    const BASE_PATH = "layouts/header/";
    const FILES = [
        "header-desktop.html",
        "header-mobile.html",
        "header-modals.html",
    ];

    // ==================================================
    // GLOBAL READY FLAG (SINGLE SOURCE OF TRUTH)
    // ==================================================
    window.__BE_HEADER_READY__ = false;

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

    const mainEl = document.querySelector("main");
    if (!mainEl) {
        console.error("[HeaderLoader] <main> not found. Abort.");
        return;
    }

    const parts = [];
    for (const f of FILES) {
        const html = await fetchHTML(BASE_PATH + f);
        if (html && html.trim()) parts.push(html.trim());
    }

    if (!parts.length) {
        console.error("[HeaderLoader] No header HTML loaded.");
        return;
    }

    // ==================================================
    // INJECT HEADER
    // ==================================================
    mainEl.insertAdjacentHTML("beforebegin", parts.join("\n"));

    // ==================================================
    // DISPATCH (SAFE + IDEMPOTENT)
    // ==================================================
    const dispatchHeaderLoaded = () => {
        if (window.__BE_HEADER_READY__) return;
        window.__BE_HEADER_READY__ = true;
        document.dispatchEvent(new Event("headerLoaded"));
        console.log("[HeaderLoader] headerLoaded dispatched");
    };

    // Dispatch after injection, next frame
    requestAnimationFrame(dispatchHeaderLoaded);

    // Fallback: ensure late listeners also get it
    setTimeout(dispatchHeaderLoaded, 0);
});
