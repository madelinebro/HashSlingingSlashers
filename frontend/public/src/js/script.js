// Functionality for Main Components
// ============================================================================
// SCRIPT.JS - Global Navigation and Page Utilities
// ============================================================================

// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
  // ========================================================================
  // APPLY STORED PROFILE PICTURE ACROSS ALL PAGES
  // ========================================================================
  const storedAvatar = localStorage.getItem('userProfilePicture');
  if (storedAvatar) {
    document.querySelectorAll('.profile-avatar-img, .sidebar-user-info > img').forEach(img => {
      img.src = storedAvatar;
    });
  }

  // ========================================================================
  // ACTIVE SIDEBAR STATE
  // ========================================================================
  // Get the current page filename (e.g., "transfers.html")
  const currentPage = window.location.pathname.split('/').pop();

  // Find all sidebar links
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-item');

  // Loop through each link
  sidebarLinks.forEach(link => {
    // Remove 'active' from all
    link.classList.remove('active');

    // Add 'active' if href matches current page
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ========================================================================
  // PROFILE SYSTEM READY
  // ========================================================================
  // profile_settings.js handles all profile management automatically
  // through its initializePage() function
  console.log('BloomFi application initialized');
});