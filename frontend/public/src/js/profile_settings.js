/* ======================================================================
  BloomFi - Profile and Settings Functionality (profile_settings.js)
  Connected to Backend API
  Author: Samantha Saunsaucie 
  Date: Updated 12/05/2025
   ====================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  
  // API Configuration
  const API_BASE_URL = "http://localhost:8000/api";
  
  // User data loaded from backend
  let currentUser = null;

  // Profile picture storage keys
  const AVATAR_STORAGE_KEY = 'userProfilePicture';
  
  // Get stored avatar from localStorage
  function getStoredAvatar() {
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  }
  
  // Save avatar to localStorage
  function saveAvatarLocally(imageData) {
    localStorage.setItem(AVATAR_STORAGE_KEY, imageData);
  }
  
  // Remove stored avatar
  function removeStoredAvatar() {
    localStorage.removeItem(AVATAR_STORAGE_KEY);
  }

  // Fetch real user data from backend
  async function fetchUserData() {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      
      // Transform backend data to frontend format
      currentUser = {
        id: userData.user_id?.toString(),
        fullName: userData.username, // Backend doesn't have full_name yet
        username: userData.username,
        email: userData.email,
        mobile: userData.phone_number,
        address: "—", // Backend doesn't have address field
        memberSince: userData.created_at 
          ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : "",
        avatarUrl: "images/Generic avatar (1).svg" // Backend doesn't have picture_url yet
      };
      
      // Check if there's a saved avatar in localStorage (overrides backend)
      const storedAvatar = getStoredAvatar();
      if (storedAvatar) {
        currentUser.avatarUrl = storedAvatar;
      }
      
      // Save to localStorage for other pages
      localStorage.setItem('userProfileData', JSON.stringify(currentUser));
      
      return currentUser;
      
    } catch (error) {
      console.error("Error fetching user data from backend:", error);
      console.warn("Backend is not available - profile page requires backend connection");
      
      // Don't use fallback - show that backend is needed
      return null;
    }
  }
  
  // Update user profile - sends to backend
  async function updateUserProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email,
          phone_number: profileData.mobile
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update local data - create object if null
      if (!currentUser) {
        currentUser = {};
      }
      
      currentUser.username = profileData.username;
      currentUser.fullName = profileData.fullName;
      currentUser.email = profileData.email;
      currentUser.mobile = profileData.mobile;
      
      // Save to localStorage
      localStorage.setItem('userProfileData', JSON.stringify(currentUser));
      
      return { success: true, message: result.message || "Profile updated successfully" };
      
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: error.message || "Failed to update profile" };
    }
  }

  // Password update function (not yet implemented in backend)
  async function updatePassword(passwordData) {
    try {
      // TODO: Implement password change endpoint in backend
      // For now, just simulate success
      console.warn("Password change not yet implemented in backend");
      return { success: true, message: "Password updated successfully (feature coming soon)" };
    } catch (error) {
      console.error("Error updating password:", error);
      return { success: false, message: "Failed to update password" };
    }
  }

  // Update all avatars on page
  function updateAllAvatars(avatarUrl) {
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = avatarUrl;
    });
  }

  // Populate Profile page
  function populateProfilePage(userData) {
    if (!userData) {
      console.warn("No user data available to populate profile page");
      return;
    }
    
    updateAllAvatars(userData.avatarUrl);

    const profileName = document.querySelector('.profile-name');
    const profileUsername = document.querySelector('.profile-username');
    if (profileName) profileName.textContent = userData.fullName;
    if (profileUsername) profileUsername.textContent = `@${userData.username}`;

    const metaItems = document.querySelectorAll('.profile-meta li');
    if (metaItems.length >= 3) {
      metaItems[0].innerHTML = `<span class="meta-icon">📧</span> ${userData.email}`;
      metaItems[1].innerHTML = `<span class="meta-icon">📱</span> ${userData.mobile}`;
      metaItems[2].innerHTML = `<span class="meta-icon">🆔</span> Member since ${userData.memberSince}`;
    }

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

    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName && userData.fullName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // Populate Settings page
  function populateSettingsPage(userData) {
    if (!userData) {
      console.warn("No user data available to populate settings page");
      return;
    }
    
    updateAllAvatars(userData.avatarUrl);

    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const mobileInput = document.getElementById('mobile');

    if (fullNameInput) fullNameInput.value = userData.fullName || '';
    if (usernameInput) usernameInput.value = userData.username || '';
    if (emailInput) emailInput.value = userData.email || '';
    if (mobileInput) mobileInput.value = userData.mobile || '';

    const sidebarUserName = document.querySelector('.sidebar-user-name');
    if (sidebarUserName && userData.fullName) {
      const firstName = userData.fullName.split(' ')[0];
      sidebarUserName.childNodes[0].textContent = firstName + ' ';
    }
  }

  // Initialize page
  async function initializePage() {
    const userData = await fetchUserData();
    
    if (!userData) {
      console.warn("No user data available - backend connection required");
      return;
    }

    // Determine which page we're on and populate accordingly
    if (document.querySelector('.profile-avatar')) {
      populateProfilePage(userData);
    } else if (document.getElementById('profileForm')) {
      populateSettingsPage(userData);
    }
  }

  // Start everything
  await initializePage();

  // User menu dropdown
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

  // Logout
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='index.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userProfileData");
      removeStoredAvatar();
      window.location.href = "index.html";
    });
  }

  // Avatar upload
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImageURL = event.target.result;
        
        saveAvatarLocally(newImageURL);
        currentUser.avatarUrl = newImageURL;
        updateAllAvatars(newImageURL);
      };
      reader.readAsDataURL(file);

      // TODO: Upload to backend when endpoint is available
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      //   method: 'POST',
      //   body: formData
      // });
    });
  }

  // Remove avatar
  const avatarRemoveBtn = document.querySelector('.avatar-remove-btn');
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to remove your profile picture?')) {
        const defaultAvatar = 'images/Generic avatar (1).svg';
        
        removeStoredAvatar();
        currentUser.avatarUrl = defaultAvatar;
        updateAllAvatars(defaultAvatar);
        
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
          avatarInput.value = '';
        }
      }
    });
  }

  // Password visibility toggle
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

  // Profile form submission
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const fullName = document.getElementById("fullName").value.trim();
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const mobile = document.getElementById("mobile").value.trim();
    
      if (!fullName || !username || !email || !mobile) {
        alert("Please fill in all fields!");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address!");
        return;
      }

      const updateData = { fullName, username, email, mobile };
      
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        alert("Profile updated successfully!");
        await initializePage();
      } else {
        alert(`Error: ${result.message}`);
      }
    });
  }

  // Password form submission
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const email = document.getElementById("changeEmail").value.trim();
    
      if (!currentPassword || !newPassword || !confirmPassword || !email) {
        alert("Please fill in all fields!");
        return;
      }

      if (currentUser && email !== currentUser.email) {
        alert("Email does not match your account!");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
      }

      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long!");
        return;
      }

      const passwordData = {
        currentPassword,
        newPassword,
        email
      };

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