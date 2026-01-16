/*********************************************************
 * BetEngine Enterprise – HEADER LOADER (FINAL v7.4)
 * Injects:
 *  - header-desktop.html
 *  - header-mobile.html
 *  - header-modals.html
 *  - auth-login.html
 *  - auth-register.html
 *
 * Guarantees:
 *  - Single-run initialization even if script is loaded twice
 *  - Safe, idempotent "headerLoaded"
 *  - Late listeners always receive the event
 *********************************************************/

(function () {
  "use strict";

  // ==================================================
  // HARD SINGLE-RUN LOCK (ENTERPRISE)
  // If this file is loaded twice, the 2nd run becomes a no-op.
  // ==================================================
  if (window.__BE_HEADER_LOADER_INIT__ === true) {
    console.warn("[HeaderLoader] Duplicate header-loader.js execution detected. Skipping init.");
    return;
  }
  window.__BE_HEADER_LOADER_INIT__ = true;

  // ==================================================
  // GLOBAL READY FLAG (SINGLE SOURCE OF TRUTH)
  // Do NOT reset this to false if it already exists.
  // ==================================================
  if (typeof window.__BE_HEADER_READY__ !== "boolean") {
    window.__BE_HEADER_READY__ = false;
  }

  const BASE_PATH = "layouts/header/";
  const FILES = [
    "header-desktop.html",
    "header-mobile.html",
    "header-modals.html",
    "auth-login.html",
    "auth-register.html",
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

  function dispatchHeaderLoadedOnce() {
    if (window.__BE_HEADER_READY__) return;
    window.__BE_HEADER_READY__ = true;
    document.dispatchEvent(new Event("headerLoaded"));
    console.log("[HeaderLoader] headerLoaded dispatched");
  }

  async function init() {
    // ==================================================
    // ENTERPRISE ABORT: if header already exists, do not inject again.
    // This protects against:
    // - duplicate script tags
    // - an older header-loader version also running
    // - hot reload / partial reload scenarios
    // ==================================================
    const alreadyHasHeader =
      document.querySelector(".header-desktop") ||
      document.querySelector(".header-mobile") ||
      document.querySelector("[data-be-header='1']");

    if (alreadyHasHeader) {
      console.warn("[HeaderLoader] Header already present in DOM. Skipping injection.");
      // Still ensure event is dispatched for late listeners.
      requestAnimationFrame(dispatchHeaderLoadedOnce);
      setTimeout(dispatchHeaderLoadedOnce, 0);
      return;
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

    // Mark that the header was injected by the loader
    // (used by the enterprise abort guard above)
    const injectedDesktop = document.querySelector(".header-desktop");
    const injectedMobile = document.querySelector(".header-mobile");
    if (injectedDesktop) injectedDesktop.setAttribute("data-be-header", "1");
    if (injectedMobile) injectedMobile.setAttribute("data-be-header", "1");

    // ==================================================
    // ENTERPRISE SANITY GUARD – REMOVE DUPLICATE SEARCH
    // ==================================================
    (() => {
      const allSearch = document.querySelectorAll(".mobile-search-inline");
      if (allSearch.length > 1) {
        console.warn(
          `[HeaderLoader] Duplicate mobile-search-inline detected (${allSearch.length}). Keeping first, removing others.`
        );
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
        const topBar = document.querySelector(".header-mobile .mobile-top-bar");
        const anchor = document.querySelector(".header-mobile .mobile-search-anchor");
        const inline = anchor ? anchor.querySelector(".mobile-search-inline") : null;

        if (topBar && inline) {
          topBar.appendChild(inline);
          console.log("[HeaderLoader] Search inline moved inside top bar context");
        } else {
          console.warn("[HeaderLoader] Search relocation skipped – missing element(s):", {
            topBar,
            anchor,
            inline,
          });
        }
      } catch (err) {
        console.error("[HeaderLoader] Error while relocating search inline:", err);
      }
    })();

    // ==================================================
    // DISPATCH (SAFE + IDEMPOTENT)
    // ==================================================
    requestAnimationFrame(dispatchHeaderLoadedOnce);
    setTimeout(dispatchHeaderLoadedOnce, 0);
  }

  // DOMContentLoaded safe init (once)
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      init().catch((err) => console.error("[HeaderLoader] Init error:", err));
    },
    { once: true }
  );
})();
