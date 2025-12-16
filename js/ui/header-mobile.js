/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.3.2)
 * Mobile header behaviour (hamburger, modals, auth triggers)
 * PATCH: Rename local helpers to avoid global qs conflict
 *********************************************************/

document.addEventListener("headerLoaded", initHeaderMobile);
document.addEventListener("DOMContentLoaded", initHeaderMobile);

/* ======================================================
   UTILS (LOCAL – RENAMED)
====================================================== */
const mqs  = (sel, scope = document) => scope.querySelector(sel);
const mqsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const mon  = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ======================================================
   STATE
====================================================== */
let initialized = false;

/* ======================================================
   INIT
====================================================== */
function initHeaderMobile() {
    if (initialized) return;

    const overlay   = mqs(".mobile-menu-overlay");
    const panel     = mqs(".mobile-menu-panel");
    const toggleBtn = mqs(".mobile-menu-toggle");

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
    mon(toggleBtn, "click", (e) => {
        e.preventDefault();
        openMenu();
    });

    mon(overlay, "click", closeMenu);
    mon(panel.querySelector(".mobile-menu-close"), "click", closeMenu);

    /* =========================
       QUICK CONTROLS (MOBILE)
    ========================= */
    mon(mqs(".menu-odds"), "click", () => {
        closeMenu();
        mqs("#mobile-odds-modal")?.classList.add("show");
    });

    mon(mqs(".menu-lang"), "click", () => {
        closeMenu();
        mqs("#mobile-language-modal")?.classList.add("show");
    });

    /* =========================
       AUTH TRIGGERS (MOBILE)
    ========================= */
    mon(mqs(".menu-auth-login"), "click", () => {
        closeMenu();
        window.BE_openLogin?.();
    });

    mon(mqs(".menu-auth-register"), "click", () => {
        closeMenu();
        window.BE_openRegister?.();
    });

    /* =========================
       UNIFIED ESC HANDLER
       Priority order:
       1) Hamburger panel
       2) Mobile Odds modal
       3) Mobile Language modal
    ========================= */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        const oddsModal = mqs("#mobile-odds-modal");
        const langModal = mqs("#mobile-language-modal");

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

    console.log("header-mobile.js v6.3.2 READY");
}
