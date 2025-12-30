/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL FIX)
 * Desktop + Mobile auth rendering layer
 *
 * FIX:
 * - Desktop dropdown absolute (no CSS change)
 * - Mobile auth bound ONLY to hamburger panel (header-modals)
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

        /* --- FORCE LAYOUT (DESKTOP ONLY) --- */
        userBox.style.position = "relative";
        dropdown.style.position = "absolute";
        dropdown.style.top = "100%";
        dropdown.style.right = "0";
        dropdown.style.zIndex = "9999";
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
            dropdown.style.setProperty("display", "none", "important");
            return;
        }

        /* --- TOGGLE DROPDOWN --- */
        userToggle.onclick = (e) => {
            e.stopPropagation();
            const open = dropdown.style.display === "block";
            dropdown.style.setProperty(
                "display",
                open ? "none" : "block",
                "important"
            );
        };

        /* --- CLICK OUTSIDE CLOSE --- */
        document.addEventListener("click", () => {
            dropdown.style.setProperty("display", "none", "important");
        });

        /* --- LOGOUT --- */
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                window.BEAuth?.clearAuth();
            };
        }
    }

    /* ============================
       MOBILE UI (HAMBURGER ONLY)
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

    if (window.BEAuth?.getState) {
        apply(window.BEAuth.getState());
    }

})();
