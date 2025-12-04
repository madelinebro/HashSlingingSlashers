/* ======================================================================
  BloomFi - Script (script.js)
  For functions that are used across multiple pages
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Wait for the page to finish loading before running any code
document.addEventListener('DOMContentLoaded', () => {
  
 
  // load users profile info
  loadUserProfileData();
  

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

  // Profile management is handled automatically by profile_settings.js
  // That file loads user data and populates profile information when needed
  console.log('BloomFi application initialized');
});


// Loads user profile data from localStorage and updates all relevant UI elements

function loadUserProfileData() {
  // Default values in case no saved data exists
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

  // Check if we have saved profile data in localStorage
  const savedProfileData = localStorage.getItem('userProfileData');
  
  if (savedProfileData) {
    try {
      // Parse and use the saved profile data
      const profileData = JSON.parse(savedProfileData);
      
      // Merge saved data with defaults (in case some fields are missing)
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
      
      console.log('Loaded saved profile data:', profileData);
    } catch (e) {
      console.error('Error parsing saved profile data:', e);
      // Continue with default values if parsing fails
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