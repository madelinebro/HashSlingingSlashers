// Wait until html document is loaded before running
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  window.location.href = "dashboard.html"; // redirect to dashboard
});

// Gets references to the eye icon, toggle button (for icon switching), and password input field
const passwordToggle = document.getElementById('passwordToggle');
const passwordInput = document.getElementById('password');
const eyeIcon = passwordToggle?.querySelector('.eye-icon');

if (passwordToggle && passwordInput) {
  // Show password when hovering over the eye icon
  passwordToggle.addEventListener('mouseenter', () => {
    passwordInput.type = 'text';
    if (eyeIcon) {
      eyeIcon.alt = 'Hiding password';
      eyeIcon.src = 'images/Eye.svg'; // Switch to Eye (on) when hovering
    }
  });
  
  // Hide password when mouse leaves the eye icon
  passwordToggle.addEventListener('mouseleave', () => {
    passwordInput.type = 'password';
    if (eyeIcon) {
      eyeIcon.alt = 'Show password';
      eyeIcon.src = 'images/Eye off.svg'; // Switch back to Eye_off when not hovering
    }
  });
}

// Username visibility toggle
const usernameToggle = document.getElementById('usernameToggle');
const usernameInput = document.getElementById('username');

if (usernameToggle && usernameInput) {
  usernameToggle.addEventListener('click', () => {
    // Toggle between text and password type
    const isText = usernameInput.type === 'text';
    usernameInput.type = isText ? 'password' : 'text';
  });
}




