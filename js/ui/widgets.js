/*********************************************************
 * BetEngine Enterprise – WIDGETS.JS (CANONICAL FINAL)
 * Widgets module registered ONLY via Core Init Bus.
 *
 * RULES
 * - NO self initialization
 * - NO direct event listeners to headerLoaded / DOMContentLoaded
 * - Core (core.js) is the ONLY orchestrator
 * - Idempotent initialization (no double init)
 *********************************************************/

(() => {
    "use strict";

    /* =====================================================
       ACCESS CORE HELPERS (SINGLE SOURCE)
    ===================================================== */
    const Be = window.Be || {};

    const qs = Be.qs || ((sel, scope = document) => scope.querySelector(sel));
    const qa = Be.qa || ((sel, scope = document) => Array.from(scope.querySelectorAll(sel)));
    const on = Be.on || ((el, ev, fn, opts) => el?.addEventListener(ev, fn, opts));

    /* =====================================================
       INTERNAL STATE (IDEMPOTENT)
    ===================================================== */
    let initialized = false;

    /* =====================================================
       TABS
    ===================================================== */
    function initTabs() {
        const groups = qa("[data-be-tabs]");
        if (!groups.length) return;

        groups.forEach(group => {
            const tabButtons = qa("[data-be-tab]", group);
            const panels     = qa("[data-be-tab-panel]", group);

            if (!tabButtons.length || !panels.length) return;

            const activate = (key) => {
                tabButtons.forEach(btn =>
                    btn.classList.toggle("active", btn.dataset.beTab === key)
                );
                panels.forEach(panel =>
                    panel.classList.toggle("active", panel.dataset.beTabPanel === key)
                );
            };

            const initial = tabButtons.find(b => b.classList.contains("active")) || tabButtons[0];
            if (initial) activate(initial.dataset.beTab);

            tabButtons.forEach(btn =>
                on(btn, "click", (e) => {
                    e.preventDefault();
                    activate(btn.dataset.beTab);
                })
            );
        });
    }

    /* =====================================================
       ACCORDIONS
    ===================================================== */
    function initAccordions() {
        const accGroups = qa("[data-be-accordion]");
        if (!accGroups.length) return;

        accGroups.forEach(group => {
            const toggles = qa("[data-be-acc-toggle]", group);

            toggles.forEach(toggle => {
                const body = toggle.nextElementSibling;
                if (!body || !body.matches("[data-be-acc-body]")) return;

                on(toggle, "click", (e) => {
                    e.preventDefault();
                    body.classList.toggle("open");
                });
            });
        });
    }

    /* =====================================================
       GENERIC TOGGLES
    ===================================================== */
    function initGenericToggles() {
        const toggles = qa("[data-be-toggle]");
        if (!toggles.length) return;

        toggles.forEach(btn => {
            const targetSelector = btn.dataset.beToggle;
            if (!targetSelector) return;

            on(btn, "click", (e) => {
                e.preventDefault();
                const target = qs(targetSelector);
                target?.classList.toggle("open");
            });
        });
    }

    /* =====================================================
       MAIN INIT (CALLED BY CORE ONLY)
    ===================================================== */
    function initWidgets() {
        if (initialized) return;   // hard idempotency
        initialized = true;

        initTabs();
        initAccordions();
        initGenericToggles();

        console.log("BetEngine Widgets initialized (canonical)");
    }

    /* =====================================================
       REGISTER WITH CORE INIT BUS
    ===================================================== */
    window.BeInit = window.BeInit || [];
    window.BeInit.push({
        name: "widgets",
        init: initWidgets
    });

})();
