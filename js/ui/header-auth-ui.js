/*********************************************************
 * BetEngine Enterprise – HEADER AUTH UI (FINAL FIX)
 * Desktop + Mobile auth rendering layer
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

        /* --- FORCE LAYOUT (CRITICAL FIX) --- */
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

        /* --- TOGGLE DROPDOWN --- */
        userToggle.onclick = (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === "block";
            dropdown.style.setProperty(
                "display",
                isOpen ? "none" : "block",
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
       MOBILE UI (FIXED TARGET)
       Auth UI lives inside .mobile-menu-panel (header-modals.html)
    ============================ */
    function applyMobile(state) {
        // Primary (current correct location)
        const panel = qs(".mobile-menu-panel");

        // Auth blocks inside hamburger panel
        const guestBox = panel ? qs(".mobile-auth-guest", panel) : null;
        const userBox  = panel ? qs(".mobile-auth-user", panel)  : null;

        // Safety fallback (old location, if exists in some builds)
        const guestFallback = !guestBox ? qs(".header-mobile .mobile-auth-guest") : null;
        const userFallback  = !userBox  ? qs(".header-mobile .mobile-auth-user")  : null;

        const guest = guestBox || guestFallback;
        const user  = userBox  || userFallback;

        if (!guest || !user) return;

        const nameEl = qs(".username", user);
        const logout = qs(".logout", user);

        if (state.authenticated) {
            guest.hidden = true;
            user.hidden = false;

            if (nameEl && state.user) {
                nameEl.textContent = state.user.username || "";
            }
        } else {
            guest.hidden = false;
            user.hidden = true;
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
