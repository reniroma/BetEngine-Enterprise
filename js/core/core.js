/*********************************************************
 * BetEngine Enterprise – CORE.JS (CANONICAL FINAL)
 * Global helpers + deterministic init orchestrator.
 *
 * RULES
 * - Core is the ONLY init orchestrator
 * - Modules MUST register via window.BeInit
 * - Core runs init on:
 *   1) DOMContentLoaded
 *   2) headerLoaded
 * - No double initialization
 * - headerLoaded is dispatched ONLY by header-loader.js
 *********************************************************/

(() => {
    "use strict";

    /* =====================================================
       GLOBAL HELPERS (SINGLE SOURCE)
    ===================================================== */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const on  = (el, event, handler, opts) => el?.addEventListener(event, handler, opts);
    const off = (el, event, handler) => el?.removeEventListener(event, handler);

    const addClass    = (el, cls) => el?.classList.add(cls);
    const removeClass = (el, cls) => el?.classList.remove(cls);
    const toggleClass = (el, cls) => el?.classList.toggle(cls);
    const hasClass    = (el, cls) => el?.classList.contains(cls);

    const lockScroll   = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };

    const scrollTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    /* =====================================================
       EXPOSE GLOBAL API (window.Be)
    ===================================================== */
    window.Be = {
        qs, qa, on, off,
        addClass, removeClass, toggleClass, hasClass,
        lockScroll, unlockScroll,
        scrollTop
    };

    /* =====================================================
       INIT BUS (CANONICAL)
    ===================================================== */
    window.BeInit = window.BeInit || [];

    const initialized = new Set();

    function runInitBus(source) {
        window.BeInit.forEach(mod => {
            if (!mod || typeof mod.init !== "function" || !mod.name) return;
            if (initialized.has(mod.name)) return;

            try {
                mod.init();
                initialized.add(mod.name);
                console.log(`[Core] Init → ${mod.name} (${source})`);
            } catch (err) {
                console.warn(`[Core] Init failed → ${mod.name}`, err);
            }
        });
    }

    /* =====================================================
       LANGUAGE BUS (FOUNDATION)
       - Receives be:langChanged from header.js + header-mobile.js
       - Keeps a stable global reference and ensures <html lang="">
    ===================================================== */
    document.addEventListener("be:langChanged", (e) => {
        const detail = (e && e.detail && typeof e.detail === "object") ? e.detail : {};
        const code = (typeof detail.code === "string") ? detail.code.trim() : "";
        const label = (typeof detail.label === "string") ? detail.label.trim() : "";

        // Stable global reference (non-visual)
        window.BE_LANG = window.BE_LANG || {};
        window.BE_LANG.current = { code, label };

        // Safety: always keep <html lang=""> aligned with the shared payload
        if (code && document.documentElement) {
            document.documentElement.setAttribute("lang", code);
        }
    });

    /* =====================================================
       BOOTSTRAP
    ===================================================== */

    // 1) Initial DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        runInitBus("DOMContentLoaded");
    });

    // 2) Header injected & ready (from header-loader.js)
    document.addEventListener("headerLoaded", () => {
        runInitBus("headerLoaded");
    });

})();
