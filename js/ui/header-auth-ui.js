/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI
 * Desktop + Mobile auth rendering layer
 *
 * RESPONSIBILITY:
 * - Listen to auth:changed
 * - Toggle Login/Register ↔ User UI
 * - Populate username
 * - Handle logout
 * - Handle desktop user dropdown (FIX)
 *
 * RULES:
 * - UI ONLY
 * - NO auth logic
 * - NO modal logic
 * - NO core logic
 *********************************************************/

(() => {
    "use strict";

    /* ============================
       HELPERS
    ============================ */
    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

    /* ============================
       DESKTOP UI
    ============================ */
    function applyDesktop(state) {
        const root         = qs(".header-desktop");
        if (!root) return;

        const loginBtns    = qa(".btn-auth.login", root);
        const registerBtns = qa(".btn-auth.register", root);
        const userBox      = qs(".auth-user", root);
        const userToggle   = qs(".auth-user-toggle", root);
        const userDropdown = qs(".auth-user-dropdown", root);
        const userName     = qs(".auth-user-name", root);
        const logoutBtn    = qs(".auth-user-logout", root);

        if (state.authenticated) {
            loginBtns.forEach(b => b.style.display = "none");
            registerBtns.forEach(b => b.style.display = "none");

            if (userBox) userBox.hidden = false;
            if (userName && state.user) {
                userName.textContent = state.user.username || "";
            }
        } else {
            loginBtns.forEach(b => b.style.display = "");
            registerBtns.forEach(b => b.style.display = "");

            if (userBox) userBox.hidden = true;
            if (userDropdown) userDropdown.hidden = true;
            return;
        }

        /* ---------- DROPDOWN FIX ---------- */
        if (userDropdown) {
            userDropdown.hidden = true;
        }

        if (userToggle && userDropdown) {
            userToggle.onclick = (e) => {
                e.stopPropagation();
                userDropdown.hidden = !userDropdown.hidden;
            };

            document.addEventListener("click", () => {
                userDropdown.hidden = true;
            });
        }

        if (logoutBtn) {
            logoutBtn.onclick = () => {
                window.BEAuth?.clearAuth();
            };
        }
    }

    /* ============================
       MOBILE UI
    ============================ */
    function applyMobile(state) {
        const root = qs(".header-mobile");
        if (!root) return;

        const guestBox = qs(".mobile-auth-guest", root);
        const userBox  = qs(".mobile-auth-user", root);
        const userName = qs(".mobile-auth-user .username", root);
        const logout   = qs(".mobile-auth-user .logout", root);

        if (!guestBox || !userBox) return;

        if (state.authenticated) {
            guestBox.hidden = true;
            userBox.hidden = false;

            if (userName && state.user) {
                userName.textContent = state.user.username || "";
            }
        } else {
            guestBox.hidden = false;
            userBox.hidden = true;
        }

        if (logout) {
            logout.onclick = (e) => {
                e.preventDefault();
                window.BEAuth?.clearAuth();
            };
        }
    }

    /* ============================
       APPLY STATE
    ============================ */
    function apply(state) {
        applyDesktop(state);
        applyMobile(state);
    }

    /* ============================
       EVENTS
    ============================ */
    document.addEventListener("auth:changed", (e) => {
        apply(e.detail);
    });

    // Initial hydrate
    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
