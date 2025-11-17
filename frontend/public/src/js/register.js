// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  // Listen for when user submits registration form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data into an object
    const formData = {
      fullName: document.getElementById("fullName").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
      confirmPassword: document.getElementById("confirmPassword").value.trim()
    };

    // Validate inputs
    const validationError = validateRegistration(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    // Submit to backend (ready for API integration)
    const success = await registerUser(formData);
    
    if (success) {
      alert("Account created successfully! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      alert("Registration failed. Please try again.");
    }
  });

  // Setup password visibility toggles
  setupPasswordToggle('passwordToggle', 'password');
  setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');
});

// ========== VALIDATION LOGIC (stays the same regardless of backend) ==========
function validateRegistration(data) {
  // Check for empty fields
  if (!data.fullName || !data.phone || !data.username || 
      !data.email || !data.password || !data.confirmPassword) {
    return "Please fill in all fields.";
  }

  // Check password match
  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
  }

  // Optional: Add more validation (email format, password strength, etc.)
  if (!isValidEmail(data.email)) {
    return "Please enter a valid email address.";
  }

  return null; // No errors
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========== BACKEND COMMUNICATION (easy to swap out) ==========
async function registerUser(userData) {
  // RIGHT NOW: Simulate successful registration
  // LATER: Replace with actual API call
  
  /* FUTURE IMPLEMENTATION:
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: userData.fullName,
        phone: userData.phone,
        username: userData.username,
        email: userData.email,
        password: userData.password
        // Note: Don't send confirmPassword to backend
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Registration error:', error);
      return false;
    }
    
    const result = await response.json();
    return true;
  } catch (error) {
    console.error('Network error:', error);
    return false;
  }
  */
  
  // Temporary: Just log the data and return success
  console.log('User registration data:', {
    ...userData,
    password: '[REDACTED]',
    confirmPassword: '[REDACTED]'
  });
  
  return true; // Simulate success
}

// ========== UI HELPER FUNCTIONS ==========
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const eyeIcon = toggle?.querySelector('.eye-icon');

  if (!toggle || !input) return;

  toggle.addEventListener('mouseenter', () => {
    input.type = 'text';
    if (eyeIcon) {
      eyeIcon.alt = 'Hiding password';
      eyeIcon.src = 'images/Eye.svg';
    }
  });

  toggle.addEventListener('mouseleave', () => {
    input.type = 'password';
    if (eyeIcon) {
      eyeIcon.alt = 'Show password';
      eyeIcon.src = 'images/Eye off.svg';
    }
  });
}