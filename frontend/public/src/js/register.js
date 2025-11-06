// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // get the registration form element
  const form = document.getElementById("registerForm");
  // if the form does not exist, stop running
  if (!form) return;
  // Listen for when user submits registration form
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevents page from refreshing
    // Get all values entered by user and remove any extra space
    const fullName = document.getElementById("full-name").value.trim();
    const phone = document.getElementById("phone-number").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("create-password").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();

    // Validate user inputs and ensure there are no empty feilds
    if (!fullName || !phone || !username || !email || !password || !confirm) {
      alert("Please fill in all fields.");
      return;
    }
    // Ensure password and confirm password match
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    // If everything is valid, show a confirmation message
    alert("Account created successfully! Redirecting to login...");
  });
});
