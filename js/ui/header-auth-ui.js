/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL v3)
 * Desktop + Mobile auth rendering layer
 *
 * FIX (ENTERPRISE):
 * - Re-apply auth state AFTER headerLoaded
 * - Re-apply auth state AFTER mobile menu is ready
 * - Solves mobile auth not updating after hamburger open
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
        const panel    = qs(".mobile-menu-panel");
        if (!panel) return;

        const guestBox = qs(".mobile-auth-guest", panel);
        const userBox  = qs(".mobile-auth-user", panel);
        const userName = qs(".mobile-auth-user .username", panel);
        const logout   = qs(".mobile-auth-user .logout", panel);

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
       SAFE APPLY (WITH RETRY)
    ============================ */
    function apply(state) {
        applyDesktop(state);
        applyMobile(state);
    }

    function applyWithRetry() {
        if (!window.BEAuth?.getState) return;

        const state = window.BEAuth.getState();

        // immediate
        apply(state);

        // next frame
        requestAnimationFrame(() => {
            apply(state);

            // safety frame (mobile panel open)
            setTimeout(() => {
                apply(state);
            }, 0);
        });
    }

    /* ============================
       EVENTS
    ============================ */

    // Auth state changed
    document.addEventListener("auth:changed", () => {
        applyWithRetry();
    });

    // Header injected after auth
    document.addEventListener("headerLoaded", () => {
        applyWithRetry();
    });

    // Initial hydrate
    if (window.BEAuth?.getState) {
        applyWithRetry();
    }

})();
