/*********************************************************
 * BetEngine Enterprise – AUTH MOCK
 * UI-only mock backend for development
 *
 * STRICT RULES:
 * - ONLY triggered by explicit login submit
 * - NEVER auto-login on page load
 * - SAFE for desktop & mobile
 *********************************************************/
(function () {
  "use strict";

  document.addEventListener("submit", (e) => {
    const form = e.target;

    // STRICT: only real login form
    if (!form || form.id !== "login-form") return;

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

    const loginModal = document.getElementById("login-modal");
    if (loginModal) {
      loginModal.classList.remove("show", "state-forgot-open");
    }

    document.body.style.overflow = "";
  });
})();
