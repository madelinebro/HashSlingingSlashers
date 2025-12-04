/* ======================================================================
  BloomFi - Profile and Settings Functionality (profile_settings.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  
  // Mock user data that simulates what we'll eventually get from a real database
  // This is temporary placeholder data for testing the frontend
  let currentUser = {
    id: "user123",
    fullName: "Jane Doe",
    username: "JaneDoe234",
    email: "jdoe@email.com",
    mobile: "(605) 338-2167",
    address: "—",
    memberSince: "May 2024",
    avatarUrl: "images/Generic avatar (1).svg"
  };

  // Since we don't have a backend yet, we're using the browser's local storage
  // to save the user's profile picture between page refreshes
  const AVATAR_STORAGE_KEY = 'userProfilePicture';
  
  // Check if there's a saved profile picture in local storage
  function getStoredAvatar() {
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  }
  
  // Save the user's profile picture to local storage
  function saveAvatarLocally(imageData) {
    localStorage.setItem(AVATAR_STORAGE_KEY, imageData);
  }
  
  // Remove the saved profile picture from local storage
  function removeStoredAvatar() {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  }

  // This function will eventually fetch real user data from the backend API
  // For now, it just returns our mock data with any saved avatar
  async function fetchUserData() {
    try {
      // When the backend is ready, we'll uncomment this code to make a real API call
      // const response = await fetch('/api/user/profile', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });
      // const userData = await response.json();
      // return userData;
      
    // Check if we have saved profile data in localStorage
    const savedProfileData = localStorage.getItem('userProfileData');
    
    if (savedProfileData) {
      // Use the saved data if it exists
      currentUser = JSON.parse(savedProfileData);
    }
    
    // Check if there's a saved avatar
    const storedAvatar = getStoredAvatar();
    if (storedAvatar) {
      currentUser.avatarUrl = storedAvatar;
    }
    
    return currentUser;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
  // This function will send updated profile information to the backend
  // Currently it just updates our local mock data
  async function updateUserProfile(profileData) {
    try {
      // Future backend call to save profile changes to the database
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(profileData)
      // });
      // return await response.json();
      
    // For now, just updating the mock data in memory
    Object.assign(currentUser, profileData);
    
    // SAVE TO LOCAL STORAGE so other pages can access it
    localStorage.setItem('userProfileData', JSON.stringify(currentUser));
    
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

  // This function will send the password change request to the backend
  // Currently it just pretends the operation was successful
  async function updatePassword(passwordData) {
    try {
      // Future backend call to change the user's password
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(passwordData)
      // });
      // return await response.json();
      
      // Temporary simulation of a successful password change
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Failed to update password" };
    }
  }

  // Update all profile pictures throughout the page to keep them consistent
  // This finds every avatar image and changes them all to the new picture
  function updateAllAvatars(avatarUrl) {
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = avatarUrl;
    });
  }

  // Fill in all the user information on the main Profile page
  function populateProfilePage(userData) {
    // Update all the profile picture images
    updateAllAvatars(userData.avatarUrl);

    // Update the name and username at the top of the profile
    const profileName = document.querySelector('.profile-name');
    const profileUsername = document.querySelector('.profile-username');
    if (profileName) profileName.textContent = userData.fullName;
    if (profileUsername) profileUsername.textContent = `@${userData.username}`;

    // Update the list showing email, phone, and member since date
    const metaItems = document.querySelectorAll('.profile-meta li');
    if (metaItems.length >= 3) {
      metaItems[0].innerHTML = `<span class="meta-icon">📧</span> ${userData.email}`;
      metaItems[1].innerHTML = `<span class="meta-icon">📱</span> ${userData.mobile}`;
      metaItems[2].innerHTML = `<span class="meta-icon">🆔</span> Member since ${userData.memberSince}`;
    }

    // Update the detailed personal information card
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach(item => {
      const label = item.querySelector('.info-label')?.textContent;
      const valueSpan = item.querySelector('.info-value');
      
      if (!valueSpan) return;
      
      // Match each label with the corresponding user data
      switch(label) {
        case 'Full Name':
          valueSpan.textContent = userData.fullName;
          break;
        case 'Username':
          valueSpan.textContent = userData.username;
          break;
        case 'Email':
          valueSpan.textContent = userData.email;
          break;
        case 'Mobile':
          valueSpan.textContent = userData.mobile;
          break;
        case 'Address':
          valueSpan.textContent = userData.address || '—';
          break;
      }
    });

    // Update the user's first name in the sidebar menu
    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // Fill in the user information on the Settings page form
  function populateSettingsPage(userData) {
    // Update the profile picture
    updateAllAvatars(userData.avatarUrl);

    // Fill in the form input fields with current user data
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');

    if (fullNameInput) fullNameInput.value = userData.fullName;
    if (usernameInput) usernameInput.value = userData.username;
    if (emailInput) emailInput.value = userData.email;
    if (mobileInput) mobileInput.value = userData.mobile;

    // Update the sidebar with the user's first name
    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // Load the user's data when the page first loads
  async function initializePage() {
    const userData = await fetchUserData();
    
    // If we can't get user data, send them back to the login page
    if (!userData) {
      window.location.href = 'login.html';
      return;
    }

    // Figure out which page we're on and populate it accordingly
    if (document.querySelector('.profile-avatar')) {
      // We're on the Profile page
      populateProfilePage(userData);
    } else if (document.getElementById('profileForm')) {
      // We're on the Settings page
      populateSettingsPage(userData);
    }
  }

  // Start everything up
  initializePage();

  // Handle the dropdown menu that appears when you click your profile picture
  const userToggle = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");
  
  if (userToggle && userMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute("aria-expanded") === "true";
      userToggle.setAttribute("aria-expanded", !expanded);
      userMenu.style.display = expanded ? "none" : "block";
      
      // Rotate the arrow icon when menu opens and closes
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = expanded ? "rotate(0deg)" : "rotate(-90deg)";
      }
    });

    // Close the dropdown menu if someone clicks anywhere else on the page
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target) && !userToggle.contains(e.target)) {
        userToggle.setAttribute("aria-expanded", "false");
        userMenu.style.display = "none";
        const chevron = userToggle.querySelector(".chev");
        if (chevron) {
          chevron.style.transform = "rotate(0deg)";
        }
      }
    });
  }

  // Handle the logout button click
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Clear all saved login information
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("authToken");
      removeStoredAvatar();
      window.location.href = "login.html";
    });
  }

  // Handle uploading a new profile picture on the Settings page
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Make sure they selected an actual image file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Make sure the image isn't too large (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      // Read the image and display it immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImageURL = event.target.result;
        
        // Save to local storage since we don't have a backend yet
        saveAvatarLocally(newImageURL);
        
        // Update our mock data
        currentUser.avatarUrl = newImageURL;
        
        // Update all the profile pictures on the page
        updateAllAvatars(newImageURL);
      };
      reader.readAsDataURL(file);

      // When backend is ready, we'll upload the image to the server
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch('/api/user/avatar', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      //   body: formData
      // });
      // const result = await response.json();
      // currentUser.avatarUrl = result.avatarUrl;
      // updateAllAvatars(result.avatarUrl);
    });
  }

  // Handle the button that removes your profile picture
  const avatarRemoveBtn = document.querySelector('.avatar-remove-btn');
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove your profile picture?')) {
        const defaultAvatar = 'images/Generic avatar (1).svg';
        
        // Remove the saved image from local storage
        removeStoredAvatar();
        
        // Set back to the default avatar
        currentUser.avatarUrl = defaultAvatar;
        
        // Update all profile pictures to show the default
        updateAllAvatars(defaultAvatar);
        
        // Clear the file selection
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
          avatarInput.value = '';
        }
        
        // When backend is ready, tell the server to remove the avatar
        // await fetch('/api/user/avatar', {
        //   method: 'DELETE',
        //   headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        // });
      }
    });
  }

  // Make password fields visible when you hover over the eye icon
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  
  toggleButtons.forEach(toggleBtn => {
    const targetId = toggleBtn.getAttribute('data-target');
    const inputField = document.getElementById(targetId);
    const eyeIcon = toggleBtn.querySelector('.eye-icon');
    
    if (inputField && eyeIcon) {
      // Show password when mouse hovers over the eye icon
      toggleBtn.addEventListener('mouseenter', () => {
        inputField.type = 'text';
        eyeIcon.alt = 'Hiding password';
        eyeIcon.src = 'images/Eye.svg';
      });
      
      // Hide password again when mouse moves away
      toggleBtn.addEventListener('mouseleave', () => {
        inputField.type = 'password';
        eyeIcon.alt = 'Show password';
        eyeIcon.src = 'images/Eye Off.svg';
      });
    }
  });

  // Handle submitting the profile update form
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      // Get all the values from the form
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
    
      // Make sure they didn't leave any fields empty
      if (!fullName || !username || !email || !mobile) {
        alert("Please fill in all fields!");
        return;
      }

      // Check that the email looks valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address!");
        return;
      }

      // Package up the changes to send to the backend
      const updateData = { fullName, username, email, mobile };
      
      // Send the update request
      const result = await updateUserProfile(updateData);
      
      // Show success or error message
      if (result.success) {
        alert("Profile updated successfully!");
        // Reload the page data to show the changes
        initializePage();
      } else {
        alert(`Error: ${result.message}`);
      }
    });
  }

  // Handle submitting the password change form
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      // Get all the password values from the form
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const email = document.getElementById("changeEmail").value.trim();
    
      // Make sure they filled in everything
      if (!currentPassword || !newPassword || !confirmPassword || !email) {
        alert("Please fill in all fields!");
        return;
      }

      // Make sure the email matches the logged-in user
      if (email !== currentUser.email) {
        alert("Email does not match your account!");
        return;
      }

      // Make sure both new password fields match
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }

      // Make sure the password is long enough for security
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
      }

      // Package up the password data for the backend
      const passwordData = {
        currentPassword,
        newPassword,
        email
      };

      // Send the password change request
      const result = await updatePassword(passwordData);
      
      // Show success or error message
      if (result.success) {
        alert("Password updated successfully!");
        passwordForm.reset();
      } else {
        alert(`Error: ${result.message}`);
      }
    });
  }
});