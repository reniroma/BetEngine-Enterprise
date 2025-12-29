/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI
 * Desktop + Mobile auth rendering layer
 *
 * RESPONSIBILITY:
 * - Listen to auth:changed
 * - Toggle Login/Register ↔ User UI
 * - Populate username
 * - Handle logout
 * - CONTROL user dropdown (desktop)
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
        const root        = qs(".header-desktop");
        if (!root) return;

        const loginBtns   = qa(".btn-auth.login", root);
        const registerBtns= qa(".btn-auth.register", root);
        const userBox     = qs(".auth-user", root);
        const userToggle  = qs(".auth-user-toggle", root);
        const userName    = qs(".auth-user-name", root);
        const dropdown    = qs(".auth-user-dropdown", root);
        const logoutBtn   = qs(".auth-user-logout", root);

        if (!userBox || !dropdown) return;

        /* ---- AUTH STATE ---- */
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
            dropdown.hidden = true;
        }

        /* ---- DROPDOWN CONTROL ---- */
        dropdown.hidden = true;

        if (userToggle) {
            userToggle.onclick = (e) => {
                e.stopPropagation();
                dropdown.hidden = !dropdown.hidden;
            };
        }

        document.addEventListener("click", (e) => {
            if (!userBox.contains(e.target)) {
                dropdown.hidden = true;
            }
        });

        /* ---- LOGOUT ---- */
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                dropdown.hidden = true;
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
