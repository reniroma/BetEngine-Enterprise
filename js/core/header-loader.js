/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL, STABLE)
 * Injects:
 *  - header-desktop.html
 *  - header-mobile.html
 *  - header-modals.html
 *  - auth-login.html
 *  - auth-register.html
 *
 * Dispatches "headerLoaded" ONCE, only after injection.
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

    mainEl.insertAdjacentHTML("beforebegin", parts.join("\n"));

    requestAnimationFrame(() => {
        document.dispatchEvent(new Event("headerLoaded"));
        console.log("[HeaderLoader] headerLoaded dispatched");
    });
});
