/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL ENTERPRISE BUILD)
 * Global helpers, UI utilities, event handling, init bus.
 * Compatible with header.js, widgets.js and all UI modules.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    const qs  = (sel, scope = document) => scope.querySelector(sel);
    const qa  = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    const on  = (el, event, handler) => el?.addEventListener(event, handler);
    const off = (el, event, handler) => el?.removeEventListener(event, handler);

    const addClass    = (el, cls) => el?.classList.add(cls);
    const removeClass = (el, cls) => el?.classList.remove(cls);
    const toggleClass = (el, cls) => el?.classList.toggle(cls);
    const hasClass    = (el, cls) => el?.classList.contains(cls);

    const lockScroll = () => { document.body.style.overflow = "hidden"; };
    const unlockScroll = () => { document.body.style.overflow = ""; };

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modalOpen = qs(".be-modal-overlay.show");
            if (modalOpen) {
                modalOpen.classList.remove("show");
                unlockScroll();
            }
        }
    });

    document.addEventListener("click", (e) => {
        qa("[data-be-autoclose]").forEach(el => {
            if (!el.contains(e.target)) el.classList.remove("show");
        });
    });

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    window.BeInit = window.BeInit || [];

    window.BeInit.push({
        name: "core",
        init: () => {
            console.log("BetEngine Core initialized");
        }
    });

    window.BeInit.forEach(m => {
        try { m.init(); }
        catch (err) { console.warn("Init error in module:", m.name, err); }
    });

    // *** MOS E HEQ KËTË PJESË ***
    document.dispatchEvent(new Event("headerLoaded"));

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
