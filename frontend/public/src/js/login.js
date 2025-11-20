// login.js - Refactored for consistency and backend readiness

// ==================== FORM SUBMISSION ====================
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

function showError(field, message) {
  clearError(field);
  const wrapper = field.closest(".input-wrapper") || field.parentElement;
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  wrapper.parentElement.appendChild(errorDiv);
  field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
  const errorMsg = field.closest(".form-group")?.querySelector(".error-message");
  if (errorMsg) errorMsg.remove();
  field.setAttribute("aria-invalid", "false");
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    clearError(usernameInput);
    clearError(passwordInput);
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (!username) {
      showError(usernameInput, "Username is required");
      return;
    }
    
    if (!password) {
      showError(passwordInput, "Password is required");
      return;
    }
    
    const credentials = { username, password };
    
    // TODO: Replace with actual API call when backend is ready
    // Example: await authenticateUser(credentials);
    
    window.location.href = "dashboard.html";
  });
}

// ==================== PASSWORD VISIBILITY TOGGLE ====================
const passwordToggle = document.getElementById("passwordToggle");
const passwordIcon = passwordToggle?.querySelector(".eye-icon");

if (passwordToggle && passwordInput && passwordIcon) {
  // Show password on hover
  passwordToggle.addEventListener("mouseenter", () => {
    passwordInput.type = "text";
    passwordIcon.src = "images/Eye.svg";
    passwordIcon.alt = "Hiding password";
  });
  
  // Hide password when hover ends
  passwordToggle.addEventListener("mouseleave", () => {
    passwordInput.type = "password";
    passwordIcon.src = "images/Eye off.svg";
    passwordIcon.alt = "Show password";
  });
}



// ==================== FUTURE: API INTEGRATION ====================
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
    // Store token, redirect, etc.
    sessionStorage.setItem('authToken', data.token);
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    console.error('Login error:', error);
    // Show error message to user
  }
}
*/


