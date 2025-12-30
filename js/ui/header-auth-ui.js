/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL FIX)
 * Desktop + Mobile auth rendering layer
 *
 * FIX:
 * - Mobile auth re-applied when hamburger menu opens
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

        /* Force dropdown out of flow */
        userBox.style.position = "relative";
        dropdown.style.position = "absolute";
        dropdown.style.top = "100%";
        dropdown.style.right = "0";
        dropdown.style.zIndex = "9999";
        dropdown.style.display = "none";
        dropdown.style.setProperty("display", "none", "important");

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
            const open = dropdown.style.display === "block";
            dropdown.style.setProperty(
                "display",
                open ? "none" : "block",
                "important"
            );
        };

        document.addEventListener("click", () => {
            dropdown.style.setProperty("display", "none", "important");
        });

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
        const panel   = qs(".mobile-menu-panel:not([hidden])");
        if (!panel) return;

        const guestBox = panel.querySelector(".mobile-auth-guest");
        const userBox  = panel.querySelector(".mobile-auth-user");
        const userName = panel.querySelector(".mobile-auth-user .username");
        const logout   = panel.querySelector(".mobile-auth-user .logout");

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

    /* Re-apply auth when mobile menu opens */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".mobile-menu-toggle");
        if (!btn) return;

        if (window.BEAuth?.getState) {
            applyMobile(window.BEAuth.getState());
        }
    });

    /* Initial hydrate */
    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
