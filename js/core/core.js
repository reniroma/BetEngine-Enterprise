/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL)
 * Global helpers + safe init bus.
 * IMPORTANT: Does NOT dispatch "headerLoaded".
 * That event is dispatched ONLY by header-loader.js.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const on  = (el, event, handler) => el?.addEventListener(event, handler);
    const off = (el, event, handler) => el?.removeEventListener(event, handler);

    const addClass    = (el, cls) => el?.classList.add(cls);
    const removeClass = (el, cls) => el?.classList.remove(cls);
    const toggleClass = (el, cls) => el?.classList.toggle(cls);
    const hasClass    = (el, cls) => el?.classList.contains(cls);

    const lockScroll   = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    window.Be = {
        qs, qa, on, off,
        addClass, removeClass, toggleClass, hasClass,
        lockScroll, unlockScroll,
        scrollTop
    };

    // Optional init bus
    window.BeInit = window.BeInit || [];
    window.BeInit.push({
        name: "core",
        init: () => console.log("[Core] Initialized")
    });

    // Run what is already registered at this point
    window.BeInit.forEach(mod => {
        try { mod.init(); }
        catch (err) { console.warn("[Core] Init error:", mod.name, err); }
    });
});
