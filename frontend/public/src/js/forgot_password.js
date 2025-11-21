/* ======================================================================
  BloomFi - Forgot Password (forgot_password.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotForm");
  const message = document.getElementById("message");

  // If the form is not found, stop running
  if (!form) return;

  // Event to listen to submit event
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data into an object
    const formData = {
      fullName: document.getElementById("fullname").value.trim(),
      email: document.getElementById("email").value.trim()
    };

    // Validate inputs
    const validationError = validatePasswordReset(formData);
    if (validationError) {
      showMessage(message, validationError, "warning");
      return;
    }

    // Show loading state
    showMessage(message, "Sending verification link...", "secondary");

    // Submit to backend 
    const success = await sendPasswordReset(formData);

    if (success) {
      showMessage(
        message,
        "If an account exists with this information, a password reset link has been sent to your email.",
        "primary"
      );
      form.reset();
    } else {
      showMessage(message, "Unable to process your request. Please try again.", "warning");
    }
  });
});

// Validation logic
function validatePasswordReset(data) {
  // Check for empty fields
  if (!data.fullName || !data.email) {
    return "Please fill out both fields.";
  }

  // Email validation
  if (!isValidEmail(data.email)) {
    return "Please enter a valid email address.";
  }

  return null; // No errors
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Future backend API call implementation
async function sendPasswordReset(userData) {
  // RIGHT NOW: Simulate password reset
  // LATER: Replace with actual API call

  /* FUTURE IMPLEMENTATION:
  try {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Password reset error:', error);
      return false;
    }

    const result = await response.json();
    return true;
  } catch (error) {
    console.error('Network error:', error);
    return false;
  }
  */

  // Simulate API call with timeout, this is just for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Password reset requested for:', {
        fullName: userData.fullName,
        email: userData.email
      });
      resolve(true); // Simulate success
    }, 1500);
  });
}

// UI helper functions
function showMessage(messageElement, text, type) {
  messageElement.textContent = text;
  
  // Map type to CSS variable colors
  const colorMap = {
    warning: "var(--warning)",
    secondary: "var(--secondary)",
    primary: "var(--primary)",
    error: "var(--warning)" // fallback
  };
  
  messageElement.style.color = colorMap[type] || "var(--secondary)";
}