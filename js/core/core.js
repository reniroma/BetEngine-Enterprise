/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL v5.0)
 * Clean core engine with NO headerLoaded interference.
 * This version is 100% compatible with:
 * - header-loader.js
 * - header.js
 * - header-mobile.js
 * - header-auth.js
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * SELECTOR HELPERS
     *******************************************************/
    const qs = (sel, scope = document) =>
        scope.querySelector(sel);

    const qa = (sel, scope = document) =>
        Array.from(scope.querySelectorAll(sel));

    const on = (el, event, handler) =>
        el?.addEventListener(event, handler);

    const off = (el, event, handler) =>
        el?.removeEventListener(event, handler);

    /*******************************************************
     * CLASS HELPERS
     *******************************************************/
    const addClass = (el, cls) => el?.classList.add(cls);
    const removeClass = (el, cls) => el?.classList.remove(cls);
    const toggleClass = (el, cls) => el?.classList.toggle(cls);
    const hasClass = (el, cls) => el?.classList.contains(cls);

    /*******************************************************
     * SCROLL CONTROL (Used by menus / modals)
     *******************************************************/
    const lockScroll = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };

    /*******************************************************
     * ESC KEY — closes generic overlays (NOT header)
     *******************************************************/
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modalOpen = qs(".be-modal-overlay.show");
            if (modalOpen) {
                modalOpen.classList.remove("show");
                unlockScroll();
            }
        }
    });

    /*******************************************************
     * CLICK OUTSIDE AUTOCLOSE (safe, header-agnostic)
     *******************************************************/
    document.addEventListener("click", (e) => {
        qa("[data-be-autoclose]").forEach(el => {
            if (!el.contains(e.target)) {
                el.classList.remove("show");
            }
        });
    });

    /*******************************************************
     * SMOOTH SCROLL
     *******************************************************/
    const scrollTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    /*******************************************************
     * GLOBAL INIT BUS (for future modules)
     *******************************************************/
    window.BeInit = window.BeInit || [];

    window.BeInit.push({
        name: "core",
        init: () => {
            console.log("BetEngine Core Initialized");
        }
    });

    /*******************************************************
     * RUN ALL REGISTERED MODULES
     *******************************************************/
    window.BeInit.forEach(mod => {
        try {
            mod.init();
        } catch (err) {
            console.warn("Init error in module:", mod.name, err);
        }
    });

    /*******************************************************
     * IMPORTANT:
     * - DO NOT FIRE headerLoaded HERE
     * - header-loader.js MUST be the ONLY source of headerLoaded
     *******************************************************/

    /*******************************************************
     * EXPORT HELPERS
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
