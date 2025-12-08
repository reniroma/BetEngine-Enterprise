/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL)
 * Global helpers, UI utilities, event handling, init bus.
 * Compatible with header.js, widgets.js and all UI modules.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * CORE SELECTOR HELPERS
     *******************************************************/
    const qs  = (sel, scope = document) => scope.querySelector(sel);
    const qa  = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const on  = (el, event, handler) => el?.addEventListener(event, handler);
    const off = (el, event, handler) => el?.removeEventListener(event, handler);


    /*******************************************************
     * CLASS HELPERS
     *******************************************************/
    const addClass    = (el, cls) => el?.classList.add(cls);
    const removeClass = (el, cls) => el?.classList.remove(cls);
    const toggleClass = (el, cls) => el?.classList.toggle(cls);
    const hasClass    = (el, cls) => el?.classList.contains(cls);


    /*******************************************************
     * BODY SCROLL CONTROL (Used by mobile modal)
     *******************************************************/
    const lockScroll = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };


    /*******************************************************
     * GLOBAL EVENT: ESC KEY
     * Header.js already handles dropdowns; core.js handles
     * universal modals / global dismissible components.
     *******************************************************/
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            // Global modal close hook
            const modalOpen = qs(".be-modal-overlay.show");
            if (modalOpen) {
                modalOpen.classList.remove("show");
                unlockScroll();
            }
        }
    });


    /*******************************************************
     * GLOBAL EVENT: CLICK OUTSIDE (Safe)
     * Does NOT interfere with header.js dropdown closing.
     *******************************************************/
    document.addEventListener("click", (e) => {
        // Close global UI elements if added in the future
        qa("[data-be-autoclose]").forEach(el => {
            if (!el.contains(e.target)) el.classList.remove("show");
        });
    });


    /*******************************************************
     * GLOBAL UTILITY: Smooth scroll to top
     *******************************************************/
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });


    /*******************************************************
     * GLOBAL INIT BUS
     * Each module can inject an initializer into window.BeInit
     *******************************************************/
    window.BeInit = window.BeInit || [];

    window.BeInit.push({
        name: "core",
        init: () => {
            console.log("BetEngine Core initialized");
        }
    });

    /*******************************************************
     * INITIALIZE ALL REGISTERED MODULES
     *******************************************************/
    window.BeInit.forEach(m => {
        try { m.init(); }
        catch (err) { console.warn("Init error in module:", m.name, err); }
    });

    /*******************************************************
     * EXPORTS FOR OTHER FILES (Optional Usage)
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

});
