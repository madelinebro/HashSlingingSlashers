// Forgot Password Functionality
// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // get references to the forgot password form and message elements
  const form = document.getElementById("forgotForm");
  const message = document.getElementById("message");

  // Event to listen to submit event
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Gets values from both input fields and removes any extra space
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();

    // Validation checks
    if (!name || !email) {
      message.textContent = "Please fill out both fields.";
      message.style.color = "var(--warning)";
      return;
    }
    // If everything is valid, show "updating" msg in blue for now
    message.textContent = "Sending verification link...";
    message.style.color = "var(--secondary)";
  });
});