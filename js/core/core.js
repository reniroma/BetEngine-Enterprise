/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL v4.1)
 * Global utility helpers, safe init bus,
 * scroll lock, event handlers, module registration.
 *
 * IMPORTANT:
 * - core.js MUST NOT dispatch "headerLoaded"
 * - header-loader.js is the ONLY dispatcher after injection
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * SELECTOR HELPERS
     *******************************************************/
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const on  = (el, event, handler) => el && el.addEventListener(event, handler);
    const off = (el, event, handler) => el && el.removeEventListener(event, handler);

    /*******************************************************
     * CLASS HELPERS
     *******************************************************/
    const addClass    = (el, cls) => el && el.classList.add(cls);
    const removeClass = (el, cls) => el && el.classList.remove(cls);
    const toggleClass = (el, cls) => el && el.classList.toggle(cls);
    const hasClass    = (el, cls) => !!(el && el.classList.contains(cls));

    /*******************************************************
     * SCROLL CONTROL
     *******************************************************/
    const lockScroll = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };

    /*******************************************************
     * ESC KEY GLOBAL HANDLER (only for be-modal-overlay)
     *******************************************************/
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        const modalOpen = qs(".be-modal-overlay.show");
        if (modalOpen) {
            modalOpen.classList.remove("show");
            unlockScroll();
        }
    });

    /*******************************************************
     * CLICK OUTSIDE (GENERIC AUTOCLOSE)
     *******************************************************/
    document.addEventListener("click", (e) => {
        qa("[data-be-autoclose]").forEach(el => {
            if (!el.contains(e.target)) el.classList.remove("show");
        });
    });

    /*******************************************************
     * SMOOTH SCROLL TOP
     *******************************************************/
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    /*******************************************************
     * MODULE REGISTRATION BUS
     *******************************************************/
    window.BeInit = window.BeInit || [];
    window.BeInit.push({
        name: "core",
        init: () => console.log("BetEngine Core Initialized (v4.1)")
    });

    /*******************************************************
     * EXPORT HELPERS TO WINDOW
     *******************************************************/
    window.Be = {
        qs,
        qa,
        on,
        off,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        lockScroll,
        unlockScroll,
        scrollTop
    };

    /*******************************************************
     * INIT ALL REGISTERED MODULES
     *******************************************************/
    window.BeInit.forEach(mod => {
        try { mod.init(); }
        catch (err) { console.warn("Init error in module:", mod.name, err); }
    });

});
