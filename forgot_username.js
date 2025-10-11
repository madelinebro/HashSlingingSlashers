// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotUsernameForm");
  const message = document.getElementById("message");
  // If the form is not found, stop running
  if (!form) return; 

  // Event to listen to submit event 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Gets values from input fields and removes any extra space
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      message.textContent = "Please fill out all fields."; // Displays error message
      message.style.color = "var(--warning)"; 
      return;
    }
     // Checks if the new password and confirm password match 
    if (password !== confirmPassword) {
      message.textContent = "Passwords do not match.";
      message.style.color = "var(--warning)";
      return;
    }

    // Simulate sending username recovery email
    message.textContent = "Verifying your information...";
    message.style.color = "var(--secondary)";
  });
});