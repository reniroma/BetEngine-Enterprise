/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI
 * Desktop + Mobile auth rendering layer
 *
 * RESPONSIBILITY:
 * - Listen to auth:changed
 * - Toggle Login/Register ↔ User UI
 * - Populate username
 * - Handle logout
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
        const loginBtns    = qa(".header-desktop .btn-auth.login");
        const registerBtns = qa(".header-desktop .btn-auth.register");
        const userBox      = qs(".header-desktop .auth-user");
        const userName     = qs(".header-desktop .auth-user-name");
        const logoutBtn    = qs(".header-desktop .auth-user-logout");

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
        const guestBox = qs(".header-mobile .mobile-auth-guest");
        const userBox  = qs(".header-mobile .mobile-auth-user");
        const userName = qs(".header-mobile .mobile-auth-user .username");
        const logout   = qs(".header-mobile .mobile-auth-user .logout");

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

    // Initial hydrate (in case auth loaded before UI)
    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
