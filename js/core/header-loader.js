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
        "auth-login.html",
        "auth-register.html"
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
// ENTERPRISE SANITY GUARD – REMOVE DUPLICATE SEARCH
// ==================================================
(() => {
  const allSearch = document.querySelectorAll(".mobile-search-inline");
  if (allSearch.length > 1) {
    console.warn(`[HeaderLoader] Duplicate mobile-search-inline detected (${allSearch.length}). Keeping first, removing others.`);
    allSearch.forEach((el, idx) => {
      if (idx > 0) el.remove();
    });
  }

  const allAnchors = document.querySelectorAll(".mobile-search-anchor");
  if (allAnchors.length > 1) {
    allAnchors.forEach((el, idx) => {
      if (idx > 0) el.remove();
    });
  }
})();

    // ==================================================
// ENTERPRISE FIX – RELOCATE SEARCH INLINE INTO TOP BAR
// ==================================================
(() => {
  try {
    const topBar = document.querySelector('.header-mobile .mobile-top-bar');
    const anchor = document.querySelector('.header-mobile .mobile-search-anchor');
    const inline = anchor?.querySelector('.mobile-search-inline');

    if (topBar && inline) {
      topBar.appendChild(inline);
      console.log('[HeaderLoader] Search inline moved inside top bar context');
    } else {
      console.warn('[HeaderLoader] Search relocation skipped – missing element(s):', { topBar, anchor, inline });
    }
  } catch (err) {
    console.error('[HeaderLoader] Error while relocating search inline:', err);
  }
})();

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
