/*********************************************************
 * BetEngine Enterprise – WIDGETS JS (FINAL)
 * Global UI micro-interactions (non-header logic)
 * Includes: ripple fx, auto-hide nav shadow, scroll lock,
 * simple accordions, and utility hooks.
 *********************************************************/

document.addEventListener("DOMContentLoaded", () => {

    /*******************************************************
     * 1. RIPPLE EFFECT FOR BUTTONS
     * (Used by auth buttons, nav chips, utility buttons)
     *******************************************************/
    function initRippleFX() {
        document.querySelectorAll("button, .btn, .nav-chip, .sub-chip").forEach(el => {
            el.addEventListener("click", function (e) {
                const circle = document.createElement("span");
                circle.classList.add("be-ripple");

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                circle.style.width = circle.style.height = `${size}px`;
                circle.style.left = `${e.clientX - rect.left - size / 2}px`;
                circle.style.top = `${e.clientY - rect.top - size / 2}px`;

                this.appendChild(circle);

                setTimeout(() => circle.remove(), 450);
            });
        });
    }

    /*******************************************************
     * 2. SHADOW ON SCROLL (Desktop Header)
     *******************************************************/
    function initHeaderShadow() {
        const header = document.querySelector(".header-desktop");
        if (!header) return;

        window.addEventListener("scroll", () => {
            if (window.scrollY > 20) {
                header.classList.add("be-shadow");
            } else {
                header.classList.remove("be-shadow");
            }
        });
    }

    /*******************************************************
     * 3. SIMPLE ACCORDIONS (For future use in Premium/FAQ)
     *******************************************************/
    function initAccordions() {
        document.querySelectorAll(".be-accordion-toggle").forEach(toggle => {
            toggle.addEventListener("click", () => {
                const parent = toggle.closest(".be-accordion");
                parent.classList.toggle("open");
            });
        });
    }

    /*******************************************************
     * 4. GLOBAL SCROLL-TO-TOP BUTTON (future use)
     *******************************************************/
    function initScrollToTop() {
        const btn = document.querySelector(".be-scroll-top");
        if (!btn) return;

        window.addEventListener("scroll", () => {
            btn.classList.toggle("visible", window.scrollY > 400);
        });

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /*******************************************************
     * 5. AUTO-DETECT TOUCH DEVICE → Add body class
     *******************************************************/
    function detectTouchDevice() {
        if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
            document.body.classList.add("be-touch");
        }
    }

    /*******************************************************
     * 6. OBSERVER: Auto-expand active sections (future)
     *******************************************************/
    function initAutoExpand() {
        const targets = document.querySelectorAll("[data-auto-open]");
        if (!targets.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("open");
                }
            });
        });

        targets.forEach(t => observer.observe(t));
    }

    /*******************************************************
     * INITIALIZE ALL WIDGETS
     *******************************************************/
    initRippleFX();
    initHeaderShadow();
    initAccordions();
    initScrollToTop();
    detectTouchDevice();
    initAutoExpand();
});
