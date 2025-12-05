/* ======================================================================
  BloomFi - Mobile Footer (mobile_footer.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

   // Initializes the mobile footer navigation bar
function initMobileFooter() {
  const footerContainer = document.getElementById('mobile-footer');
  // Exit if footer container doesn't exist on this page
  if (!footerContainer) return;

  // Determine current page for active state
  const currentPage = getCurrentPage();

  // Create footer with 4 navigation icons
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
        <a class="menu-nav-item" href="index.html">
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

// Show notifications--placeholder message
function showNotifications() {
  alert('Notifications feature coming soon!');
}

// Show AI chatbot messages 
// Show AI chatbot messages - opens the chatbot window
function showMessages() {
  const chatbotWindow = document.querySelector('.chatbot-window');
  const chatbotBtn = document.querySelector('.chatbot');
  
  if (chatbotWindow && chatbotBtn) {
    chatbotWindow.classList.add('active');
    chatbotBtn.style.display = 'none';
    
    // Focus on input field for better UX
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
      chatbotInput.focus();
    }
  } else {
    console.error('Chatbot elements not found. Make sure chatbot.js is loaded.');
  }
}

// Navigate to profile page
function goToProfile() {
  window.location.href = 'profile.html';
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileFooter);