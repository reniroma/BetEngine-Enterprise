/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL FIX)
 * Desktop + Mobile auth rendering layer
 *
 * FIX:
 * - Bind MOBILE auth to ACTIVE hamburger panel only
 * - Prevent targeting hidden / duplicate panels
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
       DESKTOP UI (UNCHANGED)
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

        userToggle.onclick = (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === "block";
            dropdown.style.setProperty(
                "display",
                isOpen ? "none" : "block",
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
       MOBILE UI (FIXED)
    ============================ */
    function applyMobile(state) {
        // 🔴 CRITICAL FIX: target ACTIVE hamburger panel only
        let panel =
            qs(".mobile-menu-panel:not([hidden])") ||
            qs(".mobile-menu-panel");

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
