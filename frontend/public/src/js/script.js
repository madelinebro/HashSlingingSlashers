/* ======================================================================
  BloomFi - Script (script.js)
  For functions that are used across multiple pages
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Wait for the page to finish loading before running any code
document.addEventListener('DOMContentLoaded', () => {
  
  // Check if the user has a custom profile picture saved in local storage
  // If they do, update all profile pictures on the current page to show it
  const storedAvatar = localStorage.getItem('userProfilePicture');
  if (storedAvatar) {
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = storedAvatar;
    });
  }

  
  // Get the current pages filename (like transfers.html or dashboard.html)
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

  // Populate the user's first name in the sidebar on all pages with sidebars
  // Mock user data that will eventually come from a real backend
  const currentUser = {
    id: "user123",
    fullName: "Jane Doe",
    username: "JaneDoe234",
    email: "jdoe@email.com",
    mobile: "(605) 338-2167",
    address: "—",
    memberSince: "May 2024",
    avatarUrl: "images/Generic avatar (1).svg"
  };

  // Update the sidebar with the user's first name
  const userNameText = document.getElementById('userNameText');
  if (userNameText) {
    const firstName = currentUser.fullName.split(' ')[0];
    userNameText.textContent = firstName;
  }

  // Profile management is handled automatically by profile_settings.js
  // That file loads user data and populates profile information when needed
  console.log('BloomFi application initialized');
});
