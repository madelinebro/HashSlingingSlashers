// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // get references to the confirm password form and message elements
  const form = document.getElementById("confirmPasswordForm");
  const message = document.getElementById("message");

  // If the form is not found, stop running
  if (!form) return; // Prevents this from running on other pages

  // Event to listen to submit event 
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Gets values from both input fields and removes any extra space
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Validation checks
    if (!newPassword || !confirmPassword) {
      message.textContent = "Please fill out both fields."; // Displays error message
      message.style.color = "var(--warning)"; // Makes text --warning color (burnt orange)
      return; // stop, if fails
    }

    // Password must be at least 8 charaters long
    if (newPassword.length < 8) {
      message.textContent = "Password must be at least 8 characters long."; // Displays error msg
      message.style.color = "var(--warning)";
      return;
    }

    // Checks if the new password and confirm password match 
    if (newPassword !== confirmPassword) {
      message.textContent = "Passwords do not match."; // Display error msg
      message.style.color = "var(--warning)";
      return; // stop if fails
    }

    // If everything is valid, show "updating" msg in blue for now
    message.textContent = "Updating your password...";
    message.style.color = "var(--secondary)"; // Makes text --secondary color (dull teal)
  });
});
