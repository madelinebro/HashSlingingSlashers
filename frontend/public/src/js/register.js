/* ======================================================================
  BloomFi - Create Account Page/Register (register.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

   // Wait until HTML document is fully loaded before running
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  // Listen for when user submits registration form
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop the form from reloading the page

    // First, grab all the data from the form fields
    const formData = collectFormData();

    // Then, Check if everything looks good 
    const validationError = validateRegistration(formData);
    if (validationError) {
      alert(validationError);
      return; // Stop here if something is wrong
    }

    // After, disable the submit button so user cannot click it multiple times
    const submitButton = form.querySelector('.btn');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    // Send the data to the backend server
    const success = await registerUser(formData);
    
    // Handle what happens after the server responds
    if (success) {
      alert("Account created successfully! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      // Turn the button back on if registration did not work
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      alert("Registration failed. Please try again.");
    }
  });

  // Set up the eye icons that show/hide passwords when you hover over them
  setupPasswordToggle('passwordToggle', 'password');
  setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');
});


// Grab all the form values and organize them into one object
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


// Check all the form data to make sure everything is valid
function validateRegistration(data) {
  //  Make sure no fields are empty
  if (!data.fullName || !data.phone || !data.username || 
      !data.email || !data.password || !data.confirmPassword) {
    return "Please fill in all fields.";
  }

  // Make sure they entered both first and last name
  const nameParts = data.fullName.split(' ').filter(part => part.length > 0);
  if (nameParts.length < 2) {
    return "Please enter your full name (first and last name).";
  }

  // Make sure there are no numbers in the name
  if (/\d/.test(data.fullName)) {
    return "Name cannot contain numbers.";
  }

  // Validate phone number format
  // Strip out everything except digits to count them
  const digitsOnly = data.phone.replace(/\D/g, '');
  
  // Make sure we have exactly 10 digits
  if (digitsOnly.length !== 10) {
    return "Please enter a valid 10-digit phone number.";
  }

  // Validate username
  // Must be at least 3 characters
  if (data.username.length < 3) {
    return "Username must be at least 3 characters long.";
  }

  // Cannot be too long
  if (data.username.length > 20) {
    return "Username must be 20 characters or less.";
  }

  // No spaces allowed
  if (/\s/.test(data.username)) {
    return "Username cannot contain spaces.";
  }

  // Only letters, numbers, and underscores allowed
  if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    return "Username can only contain letters, numbers, and underscores.";
  }

  // Validate email format
  if (!isValidEmail(data.email)) {
    return "Please enter a valid email address.";
  }

  // Make sure password is strong enough
  // Must be at least 8 characters
  if (data.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  // Cannot be too long 
  if (data.password.length > 128) {
    return "Password must be 128 characters or less.";
  }

  // Check for password strength requirements
  const hasUpperCase = /[A-Z]/.test(data.password);
  const hasLowerCase = /[a-z]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }

  // Make sure both password fields match
  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
  }

  // Everything looks good
  return null;
}


// Check if an email address has a valid format
function isValidEmail(email) {
  // This pattern checks for basic email structure: something@something.something
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// Send the registration data to the backend server
async function registerUser(userData) {
  // Right now we're just simulating a successful registration
  // When the backend is ready, we'll uncomment the code below
  
  // Future implementation for when FastAPI backend is connected:
  /*
  try {
    // Send the registration data to the backend API
    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Match the field names to what the backend expects
        // You might need to use snake_case like full_name instead of fullName
        full_name: userData.fullName,
        phone: userData.phone,
        username: userData.username,
        email: userData.email,
        password: userData.password
        // Don't send confirmPassword - we only needed it for validation
      })
    });
    
    // Check if the server sent back a success response
    if (!response.ok) {
      // Get the error message from the server
      const error = await response.json();
      console.error('Registration error:', error);
      
      // Show the error message to the user
      alert(error.detail || error.message || 'Registration failed. Please try again.');
      return false;
    }
    
    // Get the success response from the server
    const result = await response.json();
    
    // If the backend sends back a login token, save it for later use
    // if (result.token) {
    //   localStorage.setItem('authToken', result.token);
    // }
    
    return true;
    
  } catch (error) {
    // This catches problems like no internet connection or server being down
    console.error('Network error:', error);
    alert('Network error. Please check your connection and try again.');
    return false;
  }
  */
  
  // Temporary placeholder code until backend is ready
  // Simulate a 1 second delay like a real server would have
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Show the registration data in the console for testing
  // Hide the passwords for security
  console.log('User registration data:', {
    ...userData,
    password: '[REDACTED]',
    confirmPassword: '[REDACTED]'
  });
  
  // For testing: randomly succeed or fail
  // return Math.random() > 0.2; // 80% chance of success
  
  // For now, always pretend registration worked
  return true;
}


// Set up the eye icon button that shows and hides passwords when you hover
// When your mouse is over the eye, the password becomes visible
// When your mouse moves away, it hides again
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const eyeIcon = toggle?.querySelector('.eye-icon');

  // If the elements don not exist, just exit to avoid any errors
  if (!toggle || !input) return;

  // Show the password when mouse hovers over the eye icon
  toggle.addEventListener('mouseenter', () => {
    input.type = 'text'; // Switch from dots to actual letters
    if (eyeIcon) {
      eyeIcon.alt = 'Hiding password';
      eyeIcon.src = 'images/Eye.svg'; // Show the open eye icon
    }
  });

  // Hide the password when mouse moves away from the eye icon
  toggle.addEventListener('mouseleave', () => {
    input.type = 'password'; // Switch back to showing dots
    if (eyeIcon) {
      eyeIcon.alt = 'Show password';
      eyeIcon.src = 'images/Eye off.svg'; // Show the closed eye icon
    }
  });
}
