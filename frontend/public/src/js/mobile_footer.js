// footer.js - Mobile Footer Navigation
// Author: Samantha Saunsaucie

function initMobileFooter() {
  const footerContainer = document.getElementById('mobile-footer');
  
  if (!footerContainer) return;

  // Determine current page for active state
  const currentPage = getCurrentPage();

  // Create footer HTML with 4 icons - CORRECTED PATHS
  footerContainer.innerHTML = `
    <button class="footer-icon" id="footer-menu" title="Menu">
      <img src="images/Menu.svg" alt="Menu" />
    </button>
    <button class="footer-icon" id="footer-notifications" title="Notifications">
      <img src="images/Bell.svg" alt="Notifications" />
    </button>
    <button class="footer-icon" id="footer-messages" title="Messages">
      <img src="images/Message square.svg" alt="Messages" />
    </button>
    <button class="footer-icon"  id="footer-profile" title="Profile">
      <img src="images/Generic avatar (1).svg" alt="Profile" />
    </button>
  `;

  // Create menu overlay and panel
  createMenuPanel();

  // Attach event listeners
  document.getElementById('footer-menu').addEventListener('click', toggleMenu);
  document.getElementById('footer-notifications').addEventListener('click', showNotifications);
  document.getElementById('footer-messages').addEventListener('click', showMessages);
  document.getElementById('footer-profile').addEventListener('click', goToProfile);
}

// Get current page name from URL
function getCurrentPage() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '');
  return page || 'dashboard';
}

// Create the slide-in menu panel
function createMenuPanel() {
  const currentPage = getCurrentPage();
  
  const menuHTML = `
    <div class="menu-overlay" id="menuOverlay"></div>
    <div class="menu-panel" id="menuPanel">
      <div class="menu-header">
        <img src="images/logo.svg" alt="BloomFi Logo" />
        <button class="menu-close" id="menuClose">&times;</button>
      </div>
      <nav class="menu-nav">
        <a class="menu-nav-item ${currentPage === 'dashboard' ? 'active' : ''}" href="dashboard.html">
          <span class="menu-nav-icon">🏠</span>
          Dashboard
        </a>
        <a class="menu-nav-item ${currentPage === 'accounts' ? 'active' : ''}" href="accounts.html">
          <span class="menu-nav-icon">💳</span>
          My Accounts
        </a>
        <a class="menu-nav-item ${currentPage.includes('budgeting') ? 'active' : ''}" href="budgeting_month.html">
          <span class="menu-nav-icon">📊</span>
          Budgeting
        </a>
        <a class="menu-nav-item ${currentPage === 'transfers' ? 'active' : ''}" href="transfers.html">
          <span class="menu-nav-icon">🔄</span>
          Transfers
        </a>
        <a class="menu-nav-item ${currentPage === 'settings' ? 'active' : ''}" href="settings.html">
          <span class="menu-nav-icon">⚙️</span>
          Settings
        </a>
        <a class="menu-nav-item" href="login.html">
          <span class="menu-nav-icon">🚪</span>
          Log Out
        </a>
      </nav>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', menuHTML);

  // Attach close handlers
  document.getElementById('menuClose').addEventListener('click', closeMenu);
  document.getElementById('menuOverlay').addEventListener('click', closeMenu);
}

// Toggle menu open/close
function toggleMenu() {
  const overlay = document.getElementById('menuOverlay');
  const panel = document.getElementById('menuPanel');
  
  overlay.classList.toggle('active');
  panel.classList.toggle('active');
}

// Close menu
function closeMenu() {
  const overlay = document.getElementById('menuOverlay');
  const panel = document.getElementById('menuPanel');
  
  overlay.classList.remove('active');
  panel.classList.remove('active');
}

// Show notifications (placeholder)
function showNotifications() {
  alert('Notifications feature coming soon!');
}

// Show AI chatbot messages (placeholder)
function showMessages() {
  alert('AI Chatbot feature coming soon!');
}

// Navigate to profile page
function goToProfile() {
  window.location.href = 'profile.html';
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileFooter);