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

  // Extract reset token from URL (typically sent in password reset email)
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');

  // If no token is present, show error
  if (!resetToken) {
    showMessage("Invalid or missing reset link. Please request a new password reset.", "var(--warning)");
    form.querySelector('.submit-btn').disabled = true;
    return;
  }

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Reset message
    message.textContent = "";
    message.style.color = "";

    // VALIDATION - Client-side checks
    if (!validatePasswords(newPassword, confirmPassword)) {
      return; // Validation failed, message already shown
    }

    // BACKEND COMMUNICATION - Send to API
    await resetPasswordAPI(resetToken, newPassword);
  });

  // ========================================
  // VALIDATION LOGIC (Separated for clarity)
  // ========================================
  function validatePasswords(newPassword, confirmPassword) {
    if (!newPassword || !confirmPassword) {
      showMessage("Please fill out both fields.", "var(--warning)");
      return false;
    }

    if (newPassword.length < 8) {
      showMessage("Password must be at least 8 characters long.", "var(--warning)");
      return false;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match.", "var(--warning)");
      return false;
    }

    return true;
  }

  // ========================================
  // BACKEND API CALL (Placeholder for backend team)
  // ========================================
  async function resetPasswordAPI(token, password) {
    showMessage("Updating your password...", "var(--secondary)");
    
    // Disable submit button during API call
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;

    try {
      // TODO: Replace with actual API endpoint from backend team
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCESS - Password reset successful
        showMessage("Password reset successful! Redirecting to login...", "var(--success)");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        // ERROR - Backend returned an error
        showMessage(data.message || "Failed to reset password. Please try again.", "var(--warning)");
        submitBtn.disabled = false;
      }
    } catch (error) {
      // NETWORK ERROR - Couldn't reach backend
      console.error('Password reset error:', error);
      showMessage("Network error. Please check your connection and try again.", "var(--warning)");
      submitBtn.disabled = false;
    }
  }

  // ========================================
  // UI UPDATE HELPER
  // ========================================
  function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
  }
});