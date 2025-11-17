// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgotUsernameForm");
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
    const validationError = validateUsernameRecovery(formData);
    if (validationError) {
      showMessage(message, validationError, "warning");
      return;
    }

    // Show loading state
    showMessage(message, "Verifying your information...", "secondary");

    // Submit to backend (ready for API integration)
    const success = await recoverUsername(formData);

    if (success) {
      showMessage(
        message,
        "If an account exists with this information, your username has been sent to your email.",
        "primary"
      );
      form.reset();
    } else {
      showMessage(message, "Unable to process your request. Please try again.", "warning");
    }
  });
});

// ========== VALIDATION LOGIC ==========
function validateUsernameRecovery(data) {
  // Check for empty fields
  if (!data.fullName || !data.email) {
    return "Please fill out all fields.";
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

// ========== BACKEND COMMUNICATION ==========
async function recoverUsername(userData) {
  // RIGHT NOW: Simulate username recovery
  // LATER: Replace with actual API call

  /* FUTURE IMPLEMENTATION:
  try {
    const response = await fetch('/api/forgot-username', {
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
      console.error('Username recovery error:', error);
      return false;
    }

    const result = await response.json();
    return true;
  } catch (error) {
    console.error('Network error:', error);
    return false;
  }
  */

  // Temporary: Simulate API call with timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Username recovery requested for:', {
        fullName: userData.fullName,
        email: userData.email
      });
      resolve(true); // Simulate success
    }, 1500);
  });
}

// ========== UI HELPER FUNCTIONS ==========
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