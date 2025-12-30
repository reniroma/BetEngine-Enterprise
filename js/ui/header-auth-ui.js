/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL v2)
 * Desktop + Mobile auth rendering layer
 *
 * FIX (ENTERPRISE):
 * - Re-apply auth state AFTER headerLoaded
 * - Solves mobile auth not updating after hamburger injection
 *
 * RULES:
 * - UI ONLY
 * - NO auth logic
 * - NO modal logic
 * - NO core logic
 *********************************************************/

(() => {
    "use strict";

    const qs = (sel, scope = document) => scope.querySelector(sel);
    const qa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

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

        /* Force dropdown overlay (no CSS changes) */
        userBox.style.position = "relative";
        dropdown.style.position = "absolute";
        dropdown.style.top = "100%";
        dropdown.style.right = "0";
        dropdown.style.zIndex = "9999";
        dropdown.style.display = "none";

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

        userToggle.onclick = (e) => {
            e.stopPropagation();
            dropdown.style.display =
                dropdown.style.display === "block" ? "none" : "block";
        };

        document.addEventListener("click", () => {
            dropdown.style.display = "none";
        });

        if (logoutBtn) {
            logoutBtn.onclick = () => {
                window.BEAuth?.clearAuth();
            };
        }
    }

    /* ============================
       MOBILE UI (HAMBURGER PANEL)
    ============================ */
    function applyMobile(state) {
        const guestBox = qs(".mobile-menu-panel .mobile-auth-guest");
        const userBox  = qs(".mobile-menu-panel .mobile-auth-user");
        const userName = qs(".mobile-menu-panel .mobile-auth-user .username");
        const logout   = qs(".mobile-menu-panel .mobile-auth-user .logout");

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

    // Auth state changed
    document.addEventListener("auth:changed", (e) => {
        apply(e.detail);
    });

    // CRITICAL FIX: header injected AFTER auth
    document.addEventListener("headerLoaded", () => {
        if (window.BEAuth?.getState) {
            apply(window.BEAuth.getState());
        }
    });

    // Initial hydrate (in case everything already exists)
    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
