/*********************************************************
 * BetEngine Enterprise – AUTH MOCK (FIXED)
 * UI-only mock backend for development
 *
 * FIX:
 * - Works for desktop AND mobile
 * - No dependency on #login-modal ID
 *********************************************************/
(function () {
  "use strict";

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("form.auth-form");
    if (!form) return;

    e.preventDefault();

    if (!window.BEAuth || typeof window.BEAuth.setAuth !== "function") {
      console.warn("BEAuth service not available");
      return;
    }

    window.BEAuth.setAuth({
      user: {
        id: "mock-1",
        username: "testuser",
        email: "user@test.com"
      },
      premium: false
    });

    // Close ANY open auth modal safely
    document
      .querySelectorAll(".be-auth-overlay.show")
      .forEach(m => m.classList.remove("show"));

    document.body.style.overflow = "";
  });
})();
