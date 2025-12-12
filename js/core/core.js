/*********************************************************
 * BetEngine Enterprise – CORE.JS (FINAL v5.0)
 * Pure utility layer
 * NO UI logic
 * NO global side-effects
 *********************************************************/

(function () {
    "use strict";

    if (window.Be) return; // prevent double init

    const Be = {};

    /* ====================================================
       DOM HELPERS
    ==================================================== */
    Be.qs = (selector, scope = document) =>
        scope.querySelector(selector);

    Be.qa = (selector, scope = document) =>
        Array.from(scope.querySelectorAll(selector));

    Be.on = (el, event, handler, options) => {
        if (!el) return;
        el.addEventListener(event, handler, options || false);
    };

    /* ====================================================
       CLASS HELPERS
    ==================================================== */
    Be.addClass = (el, cls) => el && el.classList.add(cls);
    Be.removeClass = (el, cls) => el && el.classList.remove(cls);
    Be.toggleClass = (el, cls, force) =>
        el && el.classList.toggle(cls, force);

    /* ====================================================
       STATE (READ-ONLY FOR UI)
    ==================================================== */
    Be.state = Object.freeze({
        isMobile: window.matchMedia("(max-width: 900px)").matches
    });

    /* ====================================================
       SAFE UTILITIES
    ==================================================== */
    Be.noop = () => {};

    Be.once = (fn) => {
        let done = false;
        return function (...args) {
            if (done) return;
            done = true;
            fn.apply(this, args);
        };
    };

    /* ====================================================
       EXPORT
    ==================================================== */
    Object.defineProperty(window, "Be", {
        value: Be,
        writable: false,
        configurable: false
    });

    console.log("[Core] Be utilities ready");

})();
