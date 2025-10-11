// Functionality for Password Change
const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => { // Listen for when user submits password change form
      e.preventDefault();
    
      // get all the values entered from user
      const current = document.getElementById("currentPassword").value;
      const newPass = document.getElementById("newPassword").value;
      const confirm = document.getElementById("confirmPassword").value;
      const email = document.getElementById("changeEmail").value;
    
      // Ensure passwords match
      if (newPass !== confirm) {
        alert("Passwords do not match!"); // Display error msg
        return;
      }

      // Validate current password with stored data
      // Display confirmation msg to user
      alert(`Password updated successfully for ${email}`);
      passwordForm.reset(); // clear all text fields after submission
    });
  }

  // Handle logging out
  // Find logour link in user menu
  const logoutLink = document.querySelector(".user-menu a[href='login.html']");
  // if the link exists, add the functionality
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedIn");  // remove log in flag to logout
      window.location.href = "login.html"; // then redirect user back to login page
    });
  }

