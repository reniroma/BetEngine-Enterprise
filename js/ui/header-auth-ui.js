/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (DESKTOP ONLY)
 *
 * RESPONSIBILITY:
 * - React to auth:changed
 * - Toggle Login/Register ↔ User UI (DESKTOP)
 * - Handle desktop user dropdown
 *
 * DOES NOT:
 * - Touch mobile UI
 * - Touch hamburger
 * - Touch modals
 * - Handle auth logic
 *********************************************************/

(() => {
    "use strict";

    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    /* ============================
       INTERNAL STATE (SAFE)
    ============================ */
    let currentDropdown = null;
    let documentClickBound = false;

    const toggleHandlers = new WeakMap();

    function bindDocumentClickOnce() {
        if (documentClickBound) return;
        documentClickBound = true;

        document.addEventListener("click", () => {
            if (currentDropdown) currentDropdown.style.display = "none";
        });
    }

    function bindToggle(userToggle, dropdown) {
        if (!userToggle || !dropdown) return;

        const prev = toggleHandlers.get(userToggle);
        if (prev) userToggle.removeEventListener("click", prev);

        const handler = (e) => {
            e.stopPropagation();
            dropdown.style.display = (dropdown.style.display === "block") ? "none" : "block";
        };

        userToggle.addEventListener("click", handler);
        toggleHandlers.set(userToggle, handler);
    }

    /* ============================
       DESKTOP UI
    ============================ */
    function applyDesktop(state) {
        const loginBtns    = qa(".header-desktop .btn-auth.login");
        const registerBtns = qa(".header-desktop .btn-auth.register");
        const userBox      = qs(".header-desktop .auth-user");
        const userToggle   = qs(".header-desktop .auth-user-toggle");
        const dropdown     = qs(".header-desktop .auth-user-dropdown");
        const userName     = qs(".header-desktop .auth-user-name");
        const logoutBtn    = qs(".header-desktop .auth-user-logout");

        if (!userBox || !dropdown || !userToggle) return;

        bindDocumentClickOnce();

        /* Force dropdown overlay (NO CSS changes) */
        userBox.style.position = "relative";
        dropdown.style.position = "absolute";
        dropdown.style.top = "100%";
        dropdown.style.right = "0";
        dropdown.style.zIndex = "9999";
        dropdown.style.display = "none";

        currentDropdown = dropdown;

        if (state.authenticated) {
            loginBtns.forEach(b => b.style.display = "none");
            registerBtns.forEach(b => b.style.display = "none");
            userBox.hidden = false;

            if (userName && state.user) {
                userName.textContent = state.user.username || "";
            }
        } else {
            loginBtns.forEach(b => b.style.display = "");
            registerBtns.forEach(b => b.style.display = "");
            userBox.hidden = true;
            dropdown.style.display = "none";
            return;
        }

        /* Toggle dropdown */
        bindToggle(userToggle, dropdown);

        /* Logout */
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                window.BEAuth?.clearAuth();
            };
        }
    }

    /* ============================
       APPLY STATE
    ============================ */
    function apply(state) {
        applyDesktop(state);
    }

    /* ============================
       EVENTS
    ============================ */
    document.addEventListener("auth:changed", (e) => {
        apply(e.detail);
    });

    document.addEventListener("headerLoaded", () => {
        if (window.BEAuth?.getState) {
            apply(window.BEAuth.getState());
        }
    });

    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
