/* ======================================================================
  BloomFi - Log In (login.js)
  NOW CONNECTED TO BACKEND API
  Author: Samantha Saunsaucie 
  Date: 12/12/2025
   ====================================================================== */

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8000/api';

// ============================================
// FORM ELEMENTS
// ============================================
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// ============================================
// ERROR DISPLAY FUNCTIONS
// ============================================
function showError(field, message) {
  clearError(field);
  const wrapper = field.closest(".input-wrapper") || field.parentElement;
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  errorDiv.style.color = "#ef4444";
  errorDiv.style.fontSize = "0.875rem";
  errorDiv.style.marginTop = "0.5rem";
  wrapper.parentElement.appendChild(errorDiv);
  field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
  const errorMsg = field.closest(".form-group")?.querySelector(".error-message");
  if (errorMsg) errorMsg.remove();
  field.setAttribute("aria-invalid", "false");
}

function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.remove());
}

// ============================================
// LOGIN FUNCTION - CONNECTS TO BACKEND
// ============================================
async function authenticateUser(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return {
      success: true,
      userId: data.user_id,
      username: data.username
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    clearAllErrors();
    
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
    
    const submitButton = loginForm.querySelector('.btn');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<img src="images/Log in.svg" alt="" class="btn-icon">Logging in...';
    
    const result = await authenticateUser(username, password);
    
    if (result.success) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userName', result.username);
      localStorage.setItem('userId', result.userId);
      
      submitButton.innerHTML = '<img src="images/Log in.svg" alt="" class="btn-icon">Success! Redirecting...';
      submitButton.style.background = '#10b981';
      
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
      
    } else {
      showError(passwordInput, result.error || "Invalid username or password");
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================
const passwordToggle = document.getElementById("passwordToggle");
const passwordIcon = passwordToggle?.querySelector(".eye-icon");

if (passwordToggle && passwordInput && passwordIcon) {
  passwordToggle.addEventListener("mouseenter", () => {
    passwordInput.type = "text";
    passwordIcon.src = "images/Eye.svg";
    passwordIcon.alt = "Hiding password";
  });
  
  passwordToggle.addEventListener("mouseleave", () => {
    passwordInput.type = "password";
    passwordIcon.src = "images/Eye off.svg";
    passwordIcon.alt = "Show password";
  });
}

// ============================================
// SHOW CREDENTIALS HELPER (FOR TESTING)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const loginCard = document.querySelector('.login-card');
  
  if (loginCard && window.location.hostname === 'localhost') {
    const helperDiv = document.createElement('div');
    helperDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      font-size: 0.875rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
    `;
    helperDiv.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 8px; color: #10b981;">🔑 Test Credentials:</div>
      <div><strong>Username:</strong> jeff</div>
      <div><strong>Password:</strong> HelloWorld</div>
    `;
    document.body.appendChild(helperDiv);
  }
});