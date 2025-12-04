/* ======================================================================
  BloomFi - Log In (login.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Form submission handling
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// Displays an error message below an input field
function showError(field, message) {
  // First clear any existing errors on this field
  clearError(field);
  const wrapper = field.closest(".input-wrapper") || field.parentElement;
  // Create a new div element to hold the error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  wrapper.parentElement.appendChild(errorDiv);   
  field.setAttribute("aria-invalid", "true");    // Mark the field as invalid for screen readers
}

// Removes any error message associated with an input field
function clearError(field) {
  const errorMsg = field.closest(".form-group")?.querySelector(".error-message");
  if (errorMsg) errorMsg.remove();  // If an error message exists, remove it from the page
  field.setAttribute("aria-invalid", "false");
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Clear any previous error messages
    clearError(usernameInput);
    clearError(passwordInput);
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Validate username field
    if (!username) {
      showError(usernameInput, "Username is required");
      return;
    }
    
    // Validate password field
    if (!password) {
      showError(passwordInput, "Password is required");
      return;
    }
    
    const credentials = { username, password };
    
    // TODO: Replace with actual API call when backend is ready
    // Example: await authenticateUser(credentials);
    
    // For now, just redirect to dashboard
    window.location.href = "dashboard.html";
  });
}

// Password visibility toggle
const passwordToggle = document.getElementById("passwordToggle");
const passwordIcon = passwordToggle?.querySelector(".eye-icon");

if (passwordToggle && passwordInput && passwordIcon) {
  // Show password when user hovers over the eye icon
  passwordToggle.addEventListener("mouseenter", () => {
    passwordInput.type = "text";
    passwordIcon.src = "images/Eye.svg";
    passwordIcon.alt = "Hiding password";
  });
  
  // Hide password when user moves mouse away from the icon
  passwordToggle.addEventListener("mouseleave", () => {
    passwordInput.type = "password";
    passwordIcon.src = "images/Eye off.svg";
    passwordIcon.alt = "Show password";
  });
}

// Future API integration
// This function will handle actual authentication when backend is ready
/*
async function authenticateUser(credentials) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) throw new Error('Authentication failed');
    
    const data = await response.json();
    // Store authentication token and redirect to dashboard
    sessionStorage.setItem('authToken', data.token);
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    console.error('Login error:', error);
    // Show error message to user
  }
}
*/