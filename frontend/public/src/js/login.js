/* ======================================================================
  BloomFi - Log In (login.js)
  Author: Samantha Saunsaucie 
  Date: Updated 12/05/2025 - Backend Integration
   ====================================================================== */

// API Configuration
const API_BASE_URL = "http://localhost:8000/auth";

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

// Show loading state on submit button
function setLoading(isLoading) {
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
  }
}

// Authenticate user with backend
async function authenticateUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        email: credentials.username, // Backend expects 'email' field
        password: credentials.password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Authentication failed');
    }
    
    const data = await response.json();
    
    // Store authentication tokens
    localStorage.setItem('authToken', data.access_token);
    if (data.csrf_token) {
      localStorage.setItem('csrfToken', data.csrf_token);
    }
    
    // Store username for personalization
    localStorage.setItem('userName', credentials.username.split('@')[0]); // Use email username part
    localStorage.setItem('loggedIn', 'true');
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Re-throw to handle in form submit
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Clear any previous error messages
    clearError(usernameInput);
    clearError(passwordInput);
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Validate username field (should be email)
    if (!username) {
      showError(usernameInput, "Email is required");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      showError(usernameInput, "Please enter a valid email address");
      return;
    }
    
    // Validate password field
    if (!password) {
      showError(passwordInput, "Password is required");
      return;
    }
    
    const credentials = { username, password };
    
    // Set loading state
    setLoading(true);
    
    try {
      // Authenticate with backend
      await authenticateUser(credentials);
    } catch (error) {
      // Show error to user
      setLoading(false);
      
      if (error.message.includes('Invalid credentials') || error.message.includes('401')) {
        showError(usernameInput, "Invalid email or password");
        showError(passwordInput, "Invalid email or password");
      } else if (error.message.includes('Failed to fetch')) {
        showError(usernameInput, "Cannot connect to server. Please try again later.");
      } else {
        showError(usernameInput, error.message || "Login failed. Please try again.");
      }
    }
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