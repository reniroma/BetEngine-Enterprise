/*********************************************************
 * BetEngine Enterprise – AUTH MOCK
 * UI-only mock backend for development
 *
 * Purpose:
 * - Simulate successful login
 * - Feed BEAuth service
 * - NO coupling with header logic
 * - SAFE to delete when real API is wired
 *********************************************************/
(function () {
  "use strict";

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("#login-modal .auth-form");
    if (!form) return;

    e.preventDefault();

    // MOCK USER PAYLOAD
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

    // Close login modal safely
    const loginModal = document.getElementById("login-modal");
    if (loginModal) {
      loginModal.classList.remove("show", "state-forgot-open");
    }

    document.body.style.overflow = "";
  });
})();
