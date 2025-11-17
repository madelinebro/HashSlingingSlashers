// ============================================================================
// PROFILE_SETTINGS.JS - Dynamic User Data Management
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  
  // === MOCK USER DATA (will be replaced by backend API call) ===
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

  // === UTILITY: FETCH USER DATA FROM BACKEND ===
  async function fetchUserData() {
    try {
      // TODO: Replace with actual backend endpoint
      // const response = await fetch('/api/user/profile', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   }
      // });
      // const userData = await response.json();
      // return userData;
      
      // For now, return mock data
      return currentUser;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  // === UTILITY: UPDATE USER DATA ON BACKEND ===
  async function updateUserProfile(profileData) {
    try {
      // TODO: Replace with actual backend endpoint
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(profileData)
      // });
      // return await response.json();
      
      // For now, update mock data
      Object.assign(currentUser, profileData);
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: "Failed to update profile" };
    }
  }

  // === UTILITY: UPDATE PASSWORD ON BACKEND ===
  async function updatePassword(passwordData) {
    try {
      // TODO: Replace with actual backend endpoint
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: JSON.stringify(passwordData)
      // });
      // return await response.json();
      
      // For now, simulate success
      return { success: true, message: "Password updated successfully" };
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Failed to update password" };
    }
  }

  // === POPULATE PROFILE PAGE ===
  function populateProfilePage(userData) {
    // Update all avatar images
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = userData.avatarUrl;
      img.alt = `${userData.fullName} avatar`;
    });

    // Update profile identity section
    const profileName = document.querySelector('.profile-name');
    const profileUsername = document.querySelector('.profile-username');
    if (profileName) profileName.textContent = userData.fullName;
    if (profileUsername) profileUsername.textContent = `@${userData.username}`;

    // Update profile meta list
    const metaItems = document.querySelectorAll('.profile-meta li');
    if (metaItems.length >= 3) {
      metaItems[0].innerHTML = `<span class="meta-icon">📧</span> ${userData.email}`;
      metaItems[1].innerHTML = `<span class="meta-icon">📱</span> ${userData.mobile}`;
      metaItems[2].innerHTML = `<span class="meta-icon">🆔</span> Member since ${userData.memberSince}`;
    }

    // Update personal details card
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach(item => {
      const label = item.querySelector('.info-label')?.textContent;
      const valueSpan = item.querySelector('.info-value');
      
      if (!valueSpan) return;
      
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

    // Update sidebar user name
    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // === POPULATE SETTINGS PAGE ===
  function populateSettingsPage(userData) {
    // Update avatar
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = userData.avatarUrl;
      img.alt = `${userData.fullName} avatar`;
    });

    // Populate form fields
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');

    if (fullNameInput) fullNameInput.value = userData.fullName;
    if (usernameInput) usernameInput.value = userData.username;
    if (emailInput) emailInput.value = userData.email;
    if (mobileInput) mobileInput.value = userData.mobile;

    // Update sidebar user name
    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // === INITIALIZE PAGE WITH USER DATA ===
  async function initializePage() {
    const userData = await fetchUserData();
    
    if (!userData) {
      // Redirect to login if no user data
      window.location.href = 'login.html';
      return;
    }

    // Determine which page we're on and populate accordingly
    if (document.querySelector('.profile-avatar')) {
      // We're on the Profile page
      populateProfilePage(userData);
    } else if (document.getElementById('profileForm')) {
      // We're on the Settings page
      populateSettingsPage(userData);
    }
  }

  // Initialize the page
  initializePage();

  // === USER MENU TOGGLE ===
  const userToggle = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");
  
  if (userToggle && userMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute("aria-expanded") === "true";
      userToggle.setAttribute("aria-expanded", !expanded);
      userMenu.style.display = expanded ? "none" : "block";
      
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = expanded ? "rotate(0deg)" : "rotate(-90deg)";
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", () => {
      userToggle.setAttribute("aria-expanded", "false");
      userMenu.style.display = "none";
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = "rotate(0deg)";
      }
    });
  }

  // === LOGOUT FUNCTIONALITY ===
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Clear authentication data
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("authToken"); // Add this for backend integration
      window.location.href = "login.html";
    });
  }

  // === AVATAR UPLOAD (SETTINGS PAGE) ===
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      // Preview the image
      const reader = new FileReader();
      reader.onload = (event) => {
        document.querySelectorAll('.profile-avatar-img').forEach(img => {
          img.src = event.target.result;
        });
      };
      reader.readAsDataURL(file);

      // TODO: Upload to backend
      // const formData = new FormData();
      // formData.append('avatar', file);
      // await fetch('/api/user/avatar', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      //   body: formData
      // });
    });
  }

  // === PASSWORD VISIBILITY TOGGLES (HOVER) ===
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  
  toggleButtons.forEach(toggleBtn => {
    const targetId = toggleBtn.getAttribute('data-target');
    const inputField = document.getElementById(targetId);
    const eyeIcon = toggleBtn.querySelector('.eye-icon');
    
    if (inputField && eyeIcon) {
      toggleBtn.addEventListener('mouseenter', () => {
        inputField.type = 'text';
        eyeIcon.alt = 'Hiding password';
        eyeIcon.src = 'images/Eye.svg';
      });
      
      toggleBtn.addEventListener('mouseleave', () => {
        inputField.type = 'password';
        eyeIcon.alt = 'Show password';
        eyeIcon.src = 'images/Eye Off.svg';
      });
    }
  });

  // === PROFILE FORM SUBMISSION ===
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
    
      // Validate fields
      if (!fullName || !username || !email || !mobile) {
        alert("Please fill in all fields!");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address!");
        return;
      }

      // Prepare update data
      const updateData = { fullName, username, email, mobile };
      
      // Update backend
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        alert("Profile updated successfully!");
        // Refresh the page data
        initializePage();
      } else {
        alert(`Error: ${result.message}`);
      }
    });
  }

  // === PASSWORD FORM SUBMISSION ===
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const email = document.getElementById("changeEmail").value.trim();
    
      // Validate all fields are filled
      if (!currentPassword || !newPassword || !confirmPassword || !email) {
        alert("Please fill in all fields!");
        return;
      }

      // Verify email matches current user
      if (email !== currentUser.email) {
        alert("Email does not match your account!");
        return;
      }

      // Ensure passwords match
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }

      // Password strength validation (minimum 8 characters)
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
      }

      // Prepare password data
      const passwordData = {
        currentPassword,
        newPassword,
        email
      };

      // Update backend
      const result = await updatePassword(passwordData);
      
      if (result.success) {
        alert("Password updated successfully!");
        passwordForm.reset();
      } else {
        alert(`Error: ${result.message}`);
      }
    });
  }
});