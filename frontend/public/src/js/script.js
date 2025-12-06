/* ======================================================================
  BloomFi - Script (script.js)
  For functions that are used across multiple pages
  Connected to Backend API
  Author: Samantha Saunsaucie 
  Date: Updated 12/05/2025
   ====================================================================== */

// Wait for the page to finish loading before running any code
document.addEventListener('DOMContentLoaded', async () => {
  
  // Load user's profile info from backend
  await loadUserProfileData();
  
  // Get the current page's filename (like transfers.html or dashboard.html)
  const currentPage = window.location.pathname.split('/').pop();

  // Find all the navigation links in the sidebar
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');

  // Go through each navigation link
  sidebarLinks.forEach(link => {
    // First, remove the 'active' class from all links
    link.classList.remove('active');

    // Then, if this link points to the current page, add the active class
    // Highlights nav button so users know where they are
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  console.log('BloomFi application initialized');
});


// Loads user profile data from backend API and updates all relevant UI elements
async function loadUserProfileData() {
  // API Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Default values in case API call fails or no data exists
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

  try {
    // Fetch profile data from backend
    const response = await fetch(`${API_BASE_URL}/profile`);
    
    if (response.ok) {
      const profileData = await response.json();
      
      // Transform backend data to match frontend format
      currentUser = {
        id: profileData.user_id?.toString() || currentUser.id,
        fullName: profileData.username || currentUser.fullName, // Backend doesn't have full_name yet
        username: profileData.username || currentUser.username,
        email: profileData.email || currentUser.email,
        mobile: profileData.phone_number || currentUser.mobile,
        address: currentUser.address, // Backend doesn't have address field
        memberSince: profileData.created_at 
          ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : currentUser.memberSince,
        avatarUrl: currentUser.avatarUrl // Backend doesn't have picture_url in your current schema
      };
      
      // Save to localStorage for other pages to access
      localStorage.setItem('userProfileData', JSON.stringify(currentUser));
      
      console.log('Loaded profile data from backend:', profileData);
    } else {
      console.warn('Failed to load profile from backend, using localStorage or defaults');
      
      // Try to load from localStorage as fallback
      const savedProfileData = localStorage.getItem('userProfileData');
      if (savedProfileData) {
        try {
          const profileData = JSON.parse(savedProfileData);
          currentUser = {
            ...currentUser,
            fullName: profileData.fullName || currentUser.fullName,
            username: profileData.username || currentUser.username,
            email: profileData.email || currentUser.email,
            mobile: profileData.mobile || currentUser.mobile,
            address: profileData.address || currentUser.address,
            memberSince: profileData.memberSince || currentUser.memberSince,
            avatarUrl: profileData.avatarUrl || currentUser.avatarUrl
          };
        } catch (e) {
          console.error('Error parsing saved profile data:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching profile from backend:', error);
    
    // Fallback to localStorage
    const savedProfileData = localStorage.getItem('userProfileData');
    if (savedProfileData) {
      try {
        const profileData = JSON.parse(savedProfileData);
        currentUser = { ...currentUser, ...profileData };
      } catch (e) {
        console.error('Error parsing saved profile data:', e);
      }
    }
  }

  // Check for saved profile picture separately (it's stored in a different key)
  const storedAvatar = localStorage.getItem('userProfilePicture');
  if (storedAvatar) {
    currentUser.avatarUrl = storedAvatar;
  }

  // Update all profile pictures on the page
  document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
    img.src = currentUser.avatarUrl;
  });

  // Update the sidebar with the user's first name
  updateSidebarUserName(currentUser.fullName);
}


// Updates the user's name in the sidebar
function updateSidebarUserName(fullName) {
  const userToggleBtn = document.getElementById("userToggle");
  if (!userToggleBtn) return;

  // Extract first name
  const firstName = fullName.split(' ')[0];

  // Clear existing content
  while (userToggleBtn.firstChild) {
    userToggleBtn.removeChild(userToggleBtn.firstChild);
  }
  
  // Add user's name
  const nameText = document.createTextNode(firstName + ' ');
  userToggleBtn.appendChild(nameText);
  
  // Add back the dropdown chevron icon
  const chevron = document.createElement('img');
  chevron.className = 'chev';
  chevron.src = 'images/Chevron left.svg';
  chevron.alt = '';
  userToggleBtn.appendChild(chevron);
}