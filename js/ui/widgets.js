/*********************************************************
 * BetEngine Enterprise – WIDGETS.JS (FINAL)
 * Safe, modular UI helpers (tabs, accordions, toggles).
 * No assumptions about existing markup – runs only if
 * matching elements are present.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * ACCESS CORE HELPERS (FALLBACK IF CORE NOT LOADED)
     *******************************************************/
    const Be = window.Be || {};

    const qs  = Be.qs  || ((sel, scope = document) => scope.querySelector(sel));
    const qa  = Be.qa  || ((sel, scope = document) => Array.from(scope.querySelectorAll(sel)));
    const on  = Be.on  || ((el, ev, fn) => el && el.addEventListener(ev, fn));
    const addClass    = Be.addClass    || ((el, cls) => el && el.classList.add(cls));
    const removeClass = Be.removeClass || ((el, cls) => el && el.classList.remove(cls));


    /*******************************************************
     * TABS WIDGET
     * Markup (example for future pages):
     *
     * <div class="be-tabs" data-be-tabs>
     *   <button class="tab-btn" data-be-tab="overview">Overview</button>
     *   <button class="tab-btn" data-be-tab="stats">Stats</button>
     *   ...
     *   <div class="tab-panel" data-be-tab-panel="overview">...</div>
     *   <div class="tab-panel" data-be-tab-panel="stats">...</div>
     * </div>
     *******************************************************/
    function initTabs() {
        const groups = qa("[data-be-tabs]");
        if (!groups.length) return;

        groups.forEach(group => {
            const tabButtons = qa("[data-be-tab]", group);
            const panels     = qa("[data-be-tab-panel]", group);

            if (!tabButtons.length || !panels.length) return;

            const activate = (key) => {
                tabButtons.forEach(btn => {
                    const isActive = btn.getAttribute("data-be-tab") === key;
                    btn.classList.toggle("active", isActive);
                });

                panels.forEach(panel => {
                    const isActive = panel.getAttribute("data-be-tab-panel") === key;
                    panel.classList.toggle("active", isActive);
                });
            };

            // Default: first tab active if none is marked active
            const initial = tabButtons.find(b => b.classList.contains("active"))
                || tabButtons[0];

            if (initial) {
                activate(initial.getAttribute("data-be-tab"));
            }

            tabButtons.forEach(btn => {
                on(btn, "click", (e) => {
                    e.preventDefault();
                    const key = btn.getAttribute("data-be-tab");
                    activate(key);
                });
            });
        });
    }


    /*******************************************************
     * ACCORDION WIDGET
     * Markup (example):
     *
     * <div class="be-accordion" data-be-accordion>
     *   <button class="acc-header" data-be-acc-toggle>Title</button>
     *   <div class="acc-body" data-be-acc-body>Content</div>
     * </div>
     *******************************************************/
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
                    const isOpen = body.classList.contains("open");
                    body.classList.toggle("open", !isOpen);
                });
            });
        });
    }


    /*******************************************************
     * GENERIC TOGGLE (for future small widgets)
     * Markup:
     * <button data-be-toggle="#target-id">Toggle</button>
     * <div id="target-id" class="...">...</div>
     *******************************************************/
    function initGenericToggles() {
        const toggles = qa("[data-be-toggle]");
        if (!toggles.length) return;

        toggles.forEach(btn => {
            const targetSelector = btn.getAttribute("data-be-toggle");
            if (!targetSelector) return;

            on(btn, "click", (e) => {
                e.preventDefault();
                const target = qs(targetSelector);
                if (!target) return;
                target.classList.toggle("open");
            });
        });
    }


    /*******************************************************
     * INIT ALL WIDGETS (Only where markup exists)
     *******************************************************/
    function initWidgets() {
        initTabs();
        initAccordions();
        initGenericToggles();
        console.log("BetEngine Widgets initialized");
    }

    initWidgets();
});
