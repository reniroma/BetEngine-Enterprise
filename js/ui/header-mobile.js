/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.3.1)
 * Mobile header behaviour (hamburger, modals, auth triggers)
 * PATCH: Unified ESC handler (layer-aware, minimal)
 *********************************************************/

document.addEventListener("headerLoaded", initHeaderMobile);
document.addEventListener("DOMContentLoaded", initHeaderMobile);

/* ======================================================
   UTILS (LOCAL)
====================================================== */
const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ======================================================
   STATE
====================================================== */
let initialized = false;

/* ======================================================
   INIT
====================================================== */
function initHeaderMobile() {
    if (initialized) return;

    const overlay   = qs(".mobile-menu-overlay");
    const panel     = qs(".mobile-menu-panel");
    const toggleBtn = qs(".mobile-menu-toggle");

    // Guard: allow retry on next event if not ready
    if (!overlay || !panel || !toggleBtn) return;

    initialized = true;

    /* =========================
       CORE OPEN / CLOSE
    ========================= */
    const openMenu = () => {
        overlay.classList.add("show");
        panel.classList.add("show");
        document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
        overlay.classList.remove("show");
        panel.classList.remove("show");
        document.body.style.overflow = "";
    };

    /* =========================
       HAMBURGER
    ========================= */
    on(toggleBtn, "click", (e) => {
        e.preventDefault();
        openMenu();
    });

    on(overlay, "click", closeMenu);
    on(panel.querySelector(".mobile-menu-close"), "click", closeMenu);

    /* =========================
       QUICK CONTROLS (MOBILE)
    ========================= */
    on(qs(".menu-odds"), "click", () => {
        closeMenu();
        qs("#mobile-odds-modal")?.classList.add("show");
    });

    on(qs(".menu-lang"), "click", () => {
        closeMenu();
        qs("#mobile-language-modal")?.classList.add("show");
    });

    /* =========================
       AUTH TRIGGERS (MOBILE)
    ========================= */
    on(qs(".menu-auth-login"), "click", () => {
        closeMenu();
        window.BE_openLogin?.();
    });

    on(qs(".menu-auth-register"), "click", () => {
        closeMenu();
        window.BE_openRegister?.();
    });

    /* =========================
       UNIFIED ESC HANDLER (PATCH)
       Priority order:
       1) Hamburger panel
       2) Mobile Odds modal
       3) Mobile Language modal
    ========================= */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        const oddsModal = qs("#mobile-odds-modal");
        const langModal = qs("#mobile-language-modal");

        if (panel.classList.contains("show")) {
            closeMenu();
            return;
        }

        if (oddsModal?.classList.contains("show")) {
            oddsModal.classList.remove("show");
            document.body.style.overflow = "";
            return;
        }

        if (langModal?.classList.contains("show")) {
            langModal.classList.remove("show");
            document.body.style.overflow = "";
            return;
        }
    });

    console.log("header-mobile.js v6.3.1 READY");
}
