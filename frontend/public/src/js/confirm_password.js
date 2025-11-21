/* ======================================================================
  BloomFi - Confirm Password (confirm_password.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Wait until HTML document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // Get references to form and message elements
  const form = document.getElementById("confirmPasswordForm");
  const message = document.getElementById("message");

  // Password field visibility toggle on hover
  const passwordToggle = document.getElementById("passwordToggle");
  const passwordInput = document.getElementById("password");
  const eyeIcon = passwordToggle?.querySelector(".eye-icon");

  if (passwordToggle && passwordInput) {
    // Show password on mouse enter
    passwordToggle.addEventListener("mouseenter", () => {
      passwordInput.type = "text";
      if (eyeIcon) {
        eyeIcon.alt = "Hiding password";
        eyeIcon.src = "images/Eye.svg";
      }
    });

    // Hide password on mouse leave
    passwordToggle.addEventListener("mouseleave", () => {
      passwordInput.type = "password";
      if (eyeIcon) {
        eyeIcon.alt = "Show password";
        eyeIcon.src = "images/Eye off.svg";
      }
    });
  }

  // Confirm password field visibility toggle on hover
  const confirmPasswordToggle = document.getElementById("confirmPasswordToggle");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const confirmEyeIcon = confirmPasswordToggle?.querySelector(".eye-icon");

  if (confirmPasswordToggle && confirmPasswordInput) {
    // Show confirm password on mouse enter
    confirmPasswordToggle.addEventListener("mouseenter", () => {
      confirmPasswordInput.type = "text";
      if (confirmEyeIcon) {
        confirmEyeIcon.alt = "Hiding password";
        confirmEyeIcon.src = "images/Eye.svg";
      }
    });

    // Hide confirm password on mouse leave
    confirmPasswordToggle.addEventListener("mouseleave", () => {
      confirmPasswordInput.type = "password";
      if (confirmEyeIcon) {
        confirmEyeIcon.alt = "Show password";
        confirmEyeIcon.src = "images/Eye off.svg";
      }
    });
  }

  // Exit if form not found (prevents errors on other pages)
  if (!form) return;

  // Extract reset token from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');

  // Validate token presence
  if (!resetToken) {
    showMessage("Invalid or missing reset link. Please request a new password reset.", "var(--warning)");
    form.querySelector('.submit-btn').disabled = true;
    return;
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Clear previous messages
    message.textContent = "";
    message.style.color = "";

    // Validate passwords before API call
    if (!validatePasswords(newPassword, confirmPassword)) {
      return; // Stop if validation fails
    }

    // Send password reset request to backend
    await resetPasswordAPI(resetToken, newPassword);
  });

  // Validate password requirements and matching
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

  // Send password reset request to backend API
  async function resetPasswordAPI(token, password) {
    showMessage("Updating your password...", "var(--secondary)");
    
    // Disable submit button to prevent duplicate requests
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;

    try {
      // Replace with actual API endpoint from backend
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
        // Password reset successful
        showMessage("Password reset successful! Redirecting to login...", "var(--success)");
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        // Backend returned an error
        showMessage(data.message || "Failed to reset password. Please try again.", "var(--warning)");
        submitBtn.disabled = false;
      }
    } catch (error) {
      // Network or connection error
      console.error('Password reset error:', error);
      showMessage("Network error. Please check your connection and try again.", "var(--warning)");
      submitBtn.disabled = false;
    }
  }

  // Display message to user with specified color
  function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
  }
});