/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v6.4)
 * Mobile header behaviour (hamburger, modals, auth triggers)
 * FIX: Robust init after injected header (headerLoaded)
 *********************************************************/

/* ======================================================
   UTILS (LOCAL)
====================================================== */
const mqs = (sel, scope = document) => scope.querySelector(sel);
const mqa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const mon = (el, ev, fn) => el && el.addEventListener(ev, fn);

/* ======================================================
   STATE
====================================================== */
let mobileInitialized = false;

/* ======================================================
   INIT
====================================================== */
function initMobileHeader() {
    if (mobileInitialized) return;

    const overlay   = mqs(".mobile-menu-overlay");
    const panel     = mqs(".mobile-menu-panel");
    const toggleBtn = mqs(".mobile-menu-toggle");

    // Hard guard: all three must exist
    if (!overlay || !panel || !toggleBtn) return;

    mobileInitialized = true;

    const closeMenu = () => {
        overlay.classList.remove("show");
        panel.classList.remove("show");
        document.body.style.overflow = "";
    };

    const openMenu = () => {
        overlay.classList.add("show");
        panel.classList.add("show");
        document.body.style.overflow = "hidden";
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
       ESC PRIORITY
    ========================= */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        if (panel.classList.contains("show")) {
            closeMenu();
        }
    });

    console.log("header-mobile.js v6.4 READY");
}

/* ======================================================
   EVENT BINDING (FIXED)
====================================================== */
document.addEventListener("headerLoaded", initMobileHeader);

// Fallback for late load
if (window.__BE_HEADER_READY__ === true) {
    initMobileHeader();
}
