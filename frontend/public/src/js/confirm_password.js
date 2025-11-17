// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // get references to the confirm password form and message elements
  const form = document.getElementById("confirmPasswordForm");
  const message = document.getElementById("message");

  // Password visibility toggle - SHOW ON HOVER (Password field)
  const passwordToggle = document.getElementById("passwordToggle");
  const passwordInput = document.getElementById("password");
  const eyeIcon = passwordToggle?.querySelector(".eye-icon");

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("mouseenter", () => {
      passwordInput.type = "text";
      if (eyeIcon) {
        eyeIcon.alt = "Hiding password";
        eyeIcon.src = "images/Eye.svg";
      }
    });

    passwordToggle.addEventListener("mouseleave", () => {
      passwordInput.type = "password";
      if (eyeIcon) {
        eyeIcon.alt = "Show password";
        eyeIcon.src = "images/Eye off.svg";
      }
    });
  }

  // Password visibility toggle - SHOW ON HOVER (Confirm Password field)
  const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const confirmEyeIcon = confirmPasswordToggle?.querySelector(".eye-icon");

  if (confirmPasswordToggle && confirmPasswordInput) {
    confirmPasswordToggle.addEventListener("mouseenter", () => {
      confirmPasswordInput.type = "text";
      if (confirmEyeIcon) {
        confirmEyeIcon.alt = "Hiding password";
        confirmEyeIcon.src = "images/Eye.svg";
      }
    });

    confirmPasswordToggle.addEventListener("mouseleave", () => {
      confirmPasswordInput.type = "password";
      if (confirmEyeIcon) {
        confirmEyeIcon.alt = "Show password";
        confirmEyeIcon.src = "images/Eye off.svg";
      }
    });
  }

  // If the form is not found, stop running
  if (!form) return; // Prevents this from running on other pages

  // Form Submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPassword = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Reset message
    message.textContent = "";
    message.style.color = "";

    if (!newPassword || !confirmPassword) {
      showMessage("Please fill out both fields.", "var(--warning)");
      return;
    }

    if (newPassword.length < 8) {
      showMessage("Password must be at least 8 characters long.", "var(--warning)");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.", "var(--warning)");
      return;
    }

    showMessage("Updating your password...", "var(--secondary)");
  });

  function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
  }
});