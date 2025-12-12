/*********************************************************
 * BetEngine Enterprise – HEADER MOBILE JS (FINAL v5.4)
 * FIXED (FULLY VERIFIED):
 * - Login / Register open auth modals correctly
 * - Odds / Language close hamburger and open modal
 * - Bookmakers / Premium KEEP hamburger open (submenu UX)
 * - No event conflicts, no click leaks
 *********************************************************/

document.addEventListener("headerLoaded", () => {

    const headerMobile = document.querySelector(".header-mobile");
    const panel   = document.querySelector(".mobile-menu-panel");
    const overlay = document.querySelector(".mobile-menu-overlay");
    const modal   = document.getElementById("mobile-header-modal");

    if (!headerMobile || !panel || !overlay) return;

    const toggleBtn = headerMobile.querySelector(".mobile-menu-toggle");
    const closeBtn  = panel.querySelector(".mobile-menu-close");

    /* ----------------------------------
       SAFETY: prevent click leakage
    ---------------------------------- */
    panel.addEventListener("click", e => e.stopPropagation());

    const openMenu = () => {
        overlay.classList.add("show");
        panel.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    const closeMenu = () => {
        overlay.classList.remove("show");
        panel.classList.remove("open");
        document.body.style.overflow = "";
    };

    toggleBtn?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        openMenu();
    });

    closeBtn?.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    /* ----------------------------------
       NAVIGATION LINKS (hamburger stays)
    ---------------------------------- */
    panel.querySelectorAll(".menu-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            const section = link.dataset.section;
            const submenu = panel.querySelector(`.submenu[data-subnav="${section}"]`);

            if (submenu) {
                panel.querySelectorAll(".submenu").forEach(s =>
                    s === submenu
                        ? s.classList.toggle("open")
                        : s.classList.remove("open")
                );
            }

            if (section && typeof window.BE_activateSection === "function") {
                window.BE_activateSection(section);
            }
        });
    });

    /* ----------------------------------
       QUICK CONTROLS → OPEN MODAL
       (hamburger MUST close)
    ---------------------------------- */
    panel.querySelector(".menu-odds")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        modal?.classList.add("show");
        document.body.style.overflow = "hidden";

        modal?.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal?.querySelector(".modal-odds")?.classList.add("active");
    });

    panel.querySelector(".menu-lang")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        modal?.classList.add("show");
        document.body.style.overflow = "hidden";

        modal?.querySelectorAll(".be-modal-section")
            .forEach(s => s.classList.remove("active"));

        modal?.querySelector(".modal-language")?.classList.add("active");
    });

    /* ----------------------------------
       AUTH (LOGIN / REGISTER) – MOBILE
       REAL EVENT, NOT FAKE CLICK
    ---------------------------------- */
    panel.querySelector(".menu-auth-login")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        document.dispatchEvent(new CustomEvent("openAuth", { detail: "login" }));
    });

    panel.querySelector(".menu-auth-register")?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        document.dispatchEvent(new CustomEvent("openAuth", { detail: "register" }));
    });

    console.log("header-mobile.js v5.4 READY");
});
