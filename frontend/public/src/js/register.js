// ============================================================================
// REGISTER.JS - Complete Registration System
// ============================================================================
// This file handles user registration with comprehensive validation,
// async backend communication, and clean separation of concerns.
// ============================================================================

// Wait until HTML document is fully loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  // Listen for when user submits registration form
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    // ===== STEP 1: COLLECT FORM DATA =====
    const formData = collectFormData();

    // ===== STEP 2: VALIDATE ALL INPUTS =====
    const validationError = validateRegistration(formData);
    if (validationError) {
      alert(validationError);
      return; // Stop here if validation fails
    }

    // ===== STEP 3: DISABLE FORM DURING SUBMISSION =====
    // Prevents double-submission while waiting for backend response
    const submitButton = form.querySelector('.btn');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    // ===== STEP 4: SUBMIT TO BACKEND =====
    const success = await registerUser(formData);
    
    // ===== STEP 5: HANDLE RESPONSE =====
    if (success) {
      alert("Account created successfully! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      // Re-enable form if registration failed
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      alert("Registration failed. Please try again.");
    }
  });

  // Setup password visibility toggles for both password fields
  setupPasswordToggle('passwordToggle', 'password');
  setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');
});


// ============================================================================
// DATA COLLECTION
// ============================================================================
/**
 * Collects all form data into a clean object
 * @returns {Object} Form data with trimmed values
 */
function collectFormData() {
  return {
    fullName: document.getElementById("fullName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    username: document.getElementById("username").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    confirmPassword: document.getElementById("confirmPassword").value.trim()
  };
}


// ============================================================================
// VALIDATION LOGIC (Client-side validation before sending to backend)
// ============================================================================
/**
 * Comprehensive validation for registration data
 * This catches errors BEFORE sending to backend, saving network requests
 * @param {Object} data - The form data to validate
 * @returns {string|null} Error message if validation fails, null if all valid
 */
function validateRegistration(data) {
  // ----- CHECK 1: Empty Fields -----
  if (!data.fullName || !data.phone || !data.username || 
      !data.email || !data.password || !data.confirmPassword) {
    return "Please fill in all fields.";
  }

  // ----- CHECK 2: Full Name Validation -----
  // Ensure user enters both first and last name
  const nameParts = data.fullName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) {
    return "Please enter your full name (first and last name).";
  }

  // Check for numbers in name (optional but good practice)
  if (/\d/.test(data.fullName)) {
    return "Name cannot contain numbers.";
  }

  // ----- CHECK 3: Phone Number Validation -----
  // Remove all non-digit characters for validation
  const digitsOnly = data.phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits (adjust for your country's format)
  if (digitsOnly.length !== 10) {
    return "Please enter a valid 10-digit phone number.";
  }

  // ----- CHECK 4: Username Validation -----
  // Minimum length check
  if (data.username.length < 3) {
    return "Username must be at least 3 characters long.";
  }

  // Maximum length check (prevents database issues)
  if (data.username.length > 20) {
    return "Username must be 20 characters or less.";
  }

  // No spaces allowed in username
  if (/\s/.test(data.username)) {
    return "Username cannot contain spaces.";
  }

  // Only allow alphanumeric and underscores (common username pattern)
  if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }

  // ----- CHECK 5: Email Validation -----
  if (!isValidEmail(data.email)) {
    return "Please enter a valid email address.";
  }

  // ----- CHECK 6: Password Strength -----
  // Minimum length
  if (data.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // Maximum length (prevents buffer overflow attacks)
  if (data.password.length > 128) {
    return "Password must be 128 characters or less.";
  }

  // Password complexity requirements (optional but recommended)
  const hasUpperCase = /[A-Z]/.test(data.password);
  const hasLowerCase = /[a-z]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  // ----- CHECK 7: Password Match -----
  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
  }

  // ----- ALL CHECKS PASSED -----
  return null; // No errors found
}


/**
 * Email validation using regex pattern
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  // Standard email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// ============================================================================
// BACKEND COMMUNICATION (Async function for API calls)
// ============================================================================
/**
 * Registers a new user by sending data to the backend
 * This is an ASYNC function - it waits for the server response
 * 
 * WHY ASYNC?
 * - Network requests take time (could be milliseconds to seconds)
 * - We don't want to freeze the entire page while waiting
 * - The 'await' keyword pauses THIS function while allowing other code to run
 * 
 * @param {Object} userData - Validated user data to send to backend
 * @returns {Promise<boolean>} True if registration successful, false otherwise
 */
async function registerUser(userData) {
  // RIGHT NOW: Simulate successful registration with mock data
  // LATER: Uncomment the try-catch block below for real API integration
  
  /* ========== FUTURE IMPLEMENTATION (When Backend is Ready) ========== */
  /*
  try {
    // Send POST request to your FastAPI backend
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Map frontend field names to backend expected format
        // Adjust these based on your FastAPI model (might use snake_case)
        full_name: userData.fullName,
        phone: userData.phone,
        username: userData.username,
        email: userData.email,
        password: userData.password
        // Note: Don't send confirmPassword to backend (only needed for client validation)
      })
    });
    
    // Check if response was successful (status 200-299)
    if (!response.ok) {
      // Parse error message from backend
      const error = await response.json();
      console.error('Registration error:', error);
      
      // Show specific error message from backend if available
      alert(error.detail || error.message || 'Registration failed. Please try again.');
      return false;
    }
    
    // Parse successful response
    const result = await response.json();
    
    // Optional: Store authentication token if backend returns one
    // if (result.token) {
    //   localStorage.setItem('authToken', result.token);
    // }
    
    return true;
    
  } catch (error) {
    // This catches network errors (no internet, server down, etc.)
    console.error('Network error:', error);
    alert('Network error. Please check your connection and try again.');
    return false;
  }
  */
  
  // ===== TEMPORARY MOCK IMPLEMENTATION =====
  // Simulate network delay (remove this when using real backend)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Log the data (for testing purposes)
  console.log('User registration data:', {
    ...userData,
    password: '[REDACTED]',
    confirmPassword: '[REDACTED]'
  });
  
  // Simulate random success/failure for testing
  // return Math.random() > 0.2; // 80% success rate for testing
  
  // For now, always return success
  return true;
}


// ============================================================================
// UI HELPER FUNCTIONS
// ============================================================================
/**
 * Sets up password visibility toggle on hover
 * 
 * HOW IT WORKS:
 * - When mouse enters the eye icon, password becomes visible
 * - When mouse leaves, password is hidden again
 * - Icon image switches between "eye" and "eye off"
 * 
 * @param {string} toggleId - ID of the toggle button element
 * @param {string} inputId - ID of the password input field
 */
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const eyeIcon = toggle?.querySelector('.eye-icon');

  // Exit if elements don't exist (prevents errors)
  if (!toggle || !input) return;

  // Show password on mouse enter
  toggle.addEventListener('mouseenter', () => {
    input.type = 'text'; // Change input type to show password
    if (eyeIcon) {
      eyeIcon.alt = 'Hiding password';
      eyeIcon.src = 'images/Eye.svg'; // Eye open icon
    }
  });

  // Hide password on mouse leave
  toggle.addEventListener('mouseleave', () => {
    input.type = 'password'; // Change back to password type
    if (eyeIcon) {
      eyeIcon.alt = 'Show password';
      eyeIcon.src = 'images/Eye off.svg'; // Eye closed icon (with space as you mentioned)
    }
  });
}


// ============================================================================
// EXPLANATION OF ASYNC/AWAIT AND WHY IT DOESN'T "MESS WITH ANYTHING"
// ============================================================================
/*

WHAT IS ASYNC/AWAIT?
-------------------
Async/await is JavaScript's modern way of handling operations that take time
(like network requests, file reading, database queries, etc.)

WHY WE NEED IT:
--------------
1. Network requests aren't instant - they can take 100ms to several seconds
2. We don't want to freeze the entire webpage while waiting
3. JavaScript is "single-threaded" - it can only do one thing at a time

HOW IT WORKS:
------------
- `async` keyword: Marks a function as asynchronous
  - Always returns a Promise (a placeholder for a future value)
  
- `await` keyword: Pauses the function until the Promise resolves
  - Only works inside async functions
  - Doesn't freeze the browser - other code can still run

EXAMPLE FLOW:
------------
1. User clicks "Create Account"
2. Form submission handler runs (async function)
3. Validation happens immediately (synchronous)
4. registerUser() is called with `await`
   - This sends the fetch request
   - Function PAUSES here (but browser doesn't freeze)
   - User can still interact with other parts of the page
   - After server responds, function RESUMES
5. We check if registration was successful
6. Redirect to login or show error

DOES IT "MESS WITH ANYTHING"?
-----------------------------
NO! Here's why:

✅ Form submission is prevented (e.preventDefault()) so page doesn't reload
✅ Button is disabled during submission (prevents double-clicks)
✅ Validation happens BEFORE async operation (instant feedback)
✅ If backend takes 3 seconds, user sees "Creating Account..." message
✅ Other JavaScript on the page still works fine
✅ Browser remains responsive

ALTERNATIVE WITHOUT ASYNC/AWAIT (Old Way):
-----------------------------------------
// This is harder to read and maintain:
fetch('/api/register', {...})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Success!");
      window.location.href = "login.html";
    }
  })
  .catch(error => {
    alert("Failed!");
  });

*/