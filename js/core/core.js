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
       PATCH: AUTH SERVICE + MOCK LOADER (MINIMAL / SAFE)
       (NO SIDE EFFECTS, NO INIT COUPLING)
    ===================================================== */
    function loadScriptOnce(src) {
        if ([...document.scripts].some(s => s.src.includes(src))) return;

        const s = document.createElement("script");
        s.src = src;
        s.defer = true;
        document.head.appendChild(s);
    }

    // Load auth stack immediately (before any UI reacts)
    loadScriptOnce("/js/core/auth.service.js");
    loadScriptOnce("/js/auth-mock.js");

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
