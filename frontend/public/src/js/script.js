// Functionality for Main Components

// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
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
});