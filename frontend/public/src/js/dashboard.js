// ========== GLOBAL STATE ==========
let allTransactions = []; // Store all transactions
let filteredTransactions = []; // Store filtered transactions
let userData = {}; // Store user data
let currentFilters = {
  startDate: null,
  endDate: null,
  account: 'all',
  type: 'all',
  minAmount: null,
  maxAmount: null,
  searchTerm: ''
};

// Calendar state
let currentCalendarMonth = new Date();
let selectingStartDate = true; // Toggle between selecting start and end date
let tempStartDate = null;
let tempEndDate = null;

// ========== PAGE INITIALIZATION ==========

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // === LOAD USER DATA ===
    userData = await loadUserData();
    
    if (!userData) {
      // If no user data, redirect to login
      window.location.href = "login.html";
      return;
    }

    // Store transactions globally
    allTransactions = [...userData.transactions];
    filteredTransactions = [...userData.transactions];

    // === INITIALIZE UI ===
    initializeGreeting();
    initializeUserProfile();
    calculateAndDisplayBalance();
    updateStats();
    renderAccountChips();
    renderTransactions();
    populateAccountDropdown();
    setupEventListeners();
    
    // === SET DEFAULT DATE RANGE (Last 30 days) ===
    initializeDateRange();
    
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showErrorState("Failed to load dashboard data. Please try again.");
  }
});

// ========== DATA LOADING (Backend Ready) ==========

/**
 * Load user data from backend or localStorage
 * @returns {Promise<Object>} User data object
 */
async function loadUserData() {
  try {
    // DEVELOPMENT MODE: Check if we're using mock data
    const useMockData = true; // SET TO FALSE WHEN BACKEND IS READY
    
    if (useMockData) {
      // Get user name from localStorage if available, otherwise use default
      const storedUserName = localStorage.getItem('userName') || "Jane";
      
      // Return mock data for development
      return {
        name: storedUserName,
        accounts: [
          { id: 1, type: "Checking", number: "****3456", balance: 4890.25, color: "teal" },
          { id: 2, type: "Savings", number: "****7890", balance: 3000.20, color: "blue" }
        ],
        transactions: [
          { desc: "Electric Bill", date: "2025-10-08", amount: -120.75, accountId: 1 },
          { desc: "Paycheck", date: "2025-10-05", amount: 2500.00, accountId: 1 },
          { desc: "Grocery Store", date: "2025-10-04", amount: -89.45, accountId: 2 },
          { desc: "Streaming Subscription", date: "2025-10-03", amount: -12.99, accountId: 2 },
          { desc: "Coffee Shop", date: "2025-10-27", amount: -5.50, accountId: 1 },
          { desc: "Gas Station", date: "2025-10-26", amount: -45.00, accountId: 1 },
          { desc: "Restaurant", date: "2025-10-25", amount: -67.89, accountId: 2 },
          { desc: "Freelance Payment", date: "2025-10-24", amount: 850.00, accountId: 2 },
          { desc: "Internet Bill", date: "2025-10-20", amount: -79.99, accountId: 1 },
          { desc: "Gym Membership", date: "2025-10-15", amount: -49.99, accountId: 1 },
        ],
        previousPeriod: {
          income: 0,
          expenses: 245.00
        }
      };
    }
    
    // ========== PRODUCTION MODE: Backend API Call ==========
    // Check for auth token
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      console.warn('No authentication token found');
      return null;
    }

    const response = await fetch('/api/user/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate data structure
    if (!data.accounts || !data.transactions) {
      console.error('Invalid data structure from API');
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
}

// ========== UI INITIALIZATION ==========

/**
 * Initialize time-based greeting
 */
function initializeGreeting() {
  const greetingTitle = document.getElementById("greetingTitle");
  if (!greetingTitle) return;

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  greetingTitle.textContent = `${greeting}, ${userData.name}`;
}

/**
 * Initialize user profile in sidebar
 * Updates the user's name dynamically in the sidebar menu
 */
function initializeUserProfile() {
  const userToggleBtn = document.getElementById("userToggle");
  if (!userToggleBtn) return;

  // The button contains text and an image
  // We need to update only the text node, keeping the chevron image
  // Clear existing content
  while (userToggleBtn.firstChild) {
    userToggleBtn.removeChild(userToggleBtn.firstChild);
  }
  
  // Add user's name as text node
  const nameText = document.createTextNode(userData.name + ' ');
  userToggleBtn.appendChild(nameText);
  
  // Re-add the chevron image
  const chevron = document.createElement('img');
  chevron.className = 'chev';
  chevron.src = 'images/Chevron left.svg';
  chevron.alt = '';
  userToggleBtn.appendChild(chevron);
}

/**
 * Calculate and display total balance
 */
function calculateAndDisplayBalance() {
  const totalBalanceEl = document.getElementById("totalBalance");
  if (!totalBalanceEl) return;

  const totalBalance = userData.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  totalBalanceEl.textContent = formatCurrency(totalBalance);
}

/**
 * Render account chips dynamically
 */
function renderAccountChips() {
  const accountChipsList = document.getElementById("accountChipsList");
  if (!accountChipsList) return;

  accountChipsList.innerHTML = userData.accounts
    .map(acc => `
      <div class="account-chip-item">
        <span class="account-dot ${acc.color}"></span>
        <div>
          <div class="chip-label">${acc.type}</div>
          <div class="chip-number">${acc.number}</div>
        </div>
      </div>
    `)
    .join("");
}

/**
 * Populate account dropdown in filter modal
 */
function populateAccountDropdown() {
  const filterAccountSelect = document.getElementById("filterAccount");
  if (!filterAccountSelect) return;

  // Clear existing options except "All Accounts"
  filterAccountSelect.innerHTML = '<option value="all">All Accounts</option>';

  userData.accounts.forEach(acc => {
    const option = document.createElement("option");
    option.value = acc.id;
    option.textContent = `${acc.type} ${acc.number}`;
    filterAccountSelect.appendChild(option);
  });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // User menu toggle
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

  // Logout functionality
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
  }

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    const dateModal = document.getElementById("datePickerModal");
    const filterModal = document.getElementById("filterModal");
    
    if (e.target === dateModal) {
      closeDatePicker();
    }
    if (e.target === filterModal) {
      closeFilterModal();
    }
  });
}

/**
 * Handle user logout
 */
function handleLogout(e) {
  e.preventDefault();
  
  // Clear stored session data
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userName");
  localStorage.removeItem("authToken");
  
  // Redirect to login
  window.location.href = "login.html";
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showErrorState(message) {
  const mainContainer = document.querySelector('.main-container');
  if (!mainContainer) return;
  
  mainContainer.innerHTML = `
    <div style="text-align: center; padding: 100px; color: white;">
      <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
      <div style="font-size: 1.5rem; margin-bottom: 30px;">${message}</div>
      <button onclick="location.reload()" 
              style="padding: 15px 30px; font-size: 1.2rem; background: white; 
                     color: var(--primary); border: none; border-radius: 10px; 
                     cursor: pointer; font-weight: 700;">
        Retry
      </button>
    </div>
  `;
}

// ========== STATS CALCULATION ==========

/**
 * Calculate and update all dashboard statistics
 */
function updateStats() {
  let income = 0;
  let expenses = 0;
  
  filteredTransactions.forEach(t => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expenses += Math.abs(t.amount);
    }
  });
  
  const net = income - expenses;

  // Calculate percentage changes
  const incomeChange = calculatePercentageChange(income, userData.previousPeriod.income);
  const expenseChange = calculatePercentageChange(expenses, userData.previousPeriod.expenses);

  // Update all stat displays
  updateElement("incomeValue", formatCurrency(income));
  updateElement("expenseValue", formatCurrency(expenses));
  updateElement("netValue", net >= 0 ? `+${formatCurrency(net)}` : formatCurrency(net));
  updateElement("transactionValue", filteredTransactions.length);
  updateElement("transactionBadge", filteredTransactions.length);
  updateElement("transactionCount", `${filteredTransactions.length} new`);

  // Update stat changes with dynamic classes
  updateStatChange("incomeChange", incomeChange, true);
  updateStatChange("expenseChange", expenseChange, false);
  updateNetChange(net);
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Percentage change
 */
function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Update a stat change element
 * @param {string} elementId - ID of the element
 * @param {number} change - Percentage change value
 * @param {boolean} higherIsBetter - Whether increase is positive
 */
function updateStatChange(elementId, change, higherIsBetter) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Stat change element '${elementId}' not found`);
    return;
  }

  const isPositive = higherIsBetter ? change >= 0 : change < 0;
  const arrow = change >= 0 ? '↑' : '↓';
  
  element.textContent = `${arrow} ${Math.abs(change).toFixed(1)}%`;
  element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
}

/**
 * Update net change indicator
 * @param {number} netValue - Net change value
 */
function updateNetChange(netValue) {
  const element = document.getElementById("netChange");
  if (!element) {
    console.warn("Net change element not found");
    return;
  }

  const isPositive = netValue >= 0;
  element.textContent = isPositive ? '↑ Positive' : '↓ Negative';
  element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
}

// ========== TRANSACTION RENDERING ==========

/**
 * Render transactions table
 */
function renderTransactions() {
  const txBody = document.getElementById("txBody");
  if (!txBody) return;

  // Create account lookup map
  const accountMap = Object.fromEntries(
    userData.accounts.map(a => [a.id, a.number])
  );

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sortedTransactions.length === 0) {
    txBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 40px; color: #6b7280;">
          No transactions found for the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  txBody.innerHTML = sortedTransactions
    .map(t => `
      <tr>
        <td>${escapeHtml(t.desc)}</td>
        <td>${formatDate(t.date)}</td>
        <td class="${t.amount < 0 ? 'neg' : 'pos'}">${formatCurrency(t.amount)}</td>
        <td>${accountMap[t.accountId] || 'Unknown'}</td>
      </tr>
    `)
    .join("");
}

// ========== FILTER FUNCTIONS ==========

/**
 * Initialize default date range (last 30 days)
 */
function initializeDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  currentFilters.startDate = thirtyDaysAgo;
  currentFilters.endDate = today;
  
  updateDateRangeDisplay();
}

/**
 * Apply all active filters to transactions
 */
function applyAllFilters() {
  filteredTransactions = allTransactions.filter(transaction => {
    // Date filter
    if (currentFilters.startDate || currentFilters.endDate) {
      const txDate = normalizeDate(transaction.date);
      if (currentFilters.startDate && txDate < currentFilters.startDate) return false;
      if (currentFilters.endDate && txDate > currentFilters.endDate) return false;
    }
    
    // Account filter
    if (currentFilters.account !== 'all') {
      if (transaction.accountId !== parseInt(currentFilters.account)) return false;
    }
    
    // Type filter
    if (currentFilters.type === 'income' && transaction.amount <= 0) return false;
    if (currentFilters.type === 'expense' && transaction.amount >= 0) return false;
    
    // Amount range filter
    const absAmount = Math.abs(transaction.amount);
    if (currentFilters.minAmount !== null && absAmount < currentFilters.minAmount) return false;
    if (currentFilters.maxAmount !== null && absAmount > currentFilters.maxAmount) return false;
    
    // Search filter
    if (currentFilters.searchTerm && !transaction.desc.toLowerCase().includes(currentFilters.searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  // Update UI
  renderTransactions();
  updateStats();
}

/**
 * Open filter modal
 */
function openFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;
  
  // Set current filter values
  document.getElementById("filterAccount").value = currentFilters.account;
  document.getElementById("filterType").value = currentFilters.type;
  document.getElementById("minAmount").value = currentFilters.minAmount || '';
  document.getElementById("maxAmount").value = currentFilters.maxAmount || '';
  document.getElementById("searchDesc").value = currentFilters.searchTerm || '';
  
  modal.style.display = "flex";
}

/**
 * Close filter modal
 */
function closeFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;
  modal.style.display = "none";
}

/**
 * Apply filters from modal
 */
function applyFilters() {
  currentFilters.account = document.getElementById("filterAccount").value;
  currentFilters.type = document.getElementById("filterType").value;
  
  const minAmountValue = document.getElementById("minAmount").value;
  const maxAmountValue = document.getElementById("maxAmount").value;
  
  currentFilters.minAmount = minAmountValue ? parseFloat(minAmountValue) : null;
  currentFilters.maxAmount = maxAmountValue ? parseFloat(maxAmountValue) : null;
  currentFilters.searchTerm = document.getElementById("searchDesc").value.toLowerCase();
  
  applyAllFilters();
  closeFilterModal();
}

/**
 * Clear all filters
 */
function clearFilters() {
  currentFilters = {
    startDate: null,
    endDate: null,
    account: 'all',
    type: 'all',
    minAmount: null,
    maxAmount: null,
    searchTerm: ''
  };
  
  // Reset form fields
  document.getElementById("filterAccount").value = 'all';
  document.getElementById("filterType").value = 'all';
  document.getElementById("minAmount").value = '';
  document.getElementById("maxAmount").value = '';
  document.getElementById("searchDesc").value = '';
  
  initializeDateRange(); // Reset to default 30-day range
  applyAllFilters();
}

// ========== DATE PICKER FUNCTIONS ==========

/**
 * Open date picker modal
 */
function openDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;
  
  tempStartDate = currentFilters.startDate;
  tempEndDate = currentFilters.endDate;
  selectingStartDate = true;
  
  currentCalendarMonth = tempStartDate ? new Date(tempStartDate) : new Date();
  
  updateDateDisplay();
  renderCalendar();
  
  modal.style.display = "flex";
}

/**
 * Close date picker modal
 */
function closeDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;
  modal.style.display = "none";
}

/**
 * Set quick date filter
 * @param {string} period - 'today', 'week', 'month', or 'all'
 */
function setQuickFilter(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let startDate = new Date(today);
  
  switch(period) {
    case 'today':
      startDate = new Date(today);
      break;
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'all':
      startDate = null;
      break;
  }
  
  tempStartDate = startDate;
  tempEndDate = period === 'all' ? null : today;
  
  updateDateDisplay();
  renderCalendar();
}

/**
 * Apply selected date filter
 */
function applyDateFilter() {
  currentFilters.startDate = tempStartDate;
  currentFilters.endDate = tempEndDate;
  
  updateDateRangeDisplay();
  applyAllFilters();
  closeDatePicker();
}

/**
 * Update date range display in header
 */
function updateDateRangeDisplay() {
  const dateRangeEl = document.getElementById("dateRange");
  if (!dateRangeEl) return;
  
  if (!currentFilters.startDate && !currentFilters.endDate) {
    dateRangeEl.textContent = "All Time";
    return;
  }
  
  if (currentFilters.startDate && currentFilters.endDate) {
    dateRangeEl.textContent = `${formatDate(currentFilters.startDate)} - ${formatDate(currentFilters.endDate)}`;
  } else if (currentFilters.startDate) {
    dateRangeEl.textContent = `From ${formatDate(currentFilters.startDate)}`;
  } else if (currentFilters.endDate) {
    dateRangeEl.textContent = `Until ${formatDate(currentFilters.endDate)}`;
  }
}

// ========== CALENDAR FUNCTIONS ==========

/**
 * Render the custom calendar
 */
function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  const calendarMonthYear = document.getElementById("calendarMonthYear");
  
  if (!calendarDays || !calendarMonthYear) return;
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[currentCalendarMonth.getMonth()]} ${currentCalendarMonth.getFullYear()}`;
  
  calendarDays.innerHTML = '';
  
  const firstDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1);
  const lastDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0);
  const prevLastDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 0);
  
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Add previous month's trailing days
  for (let i = firstDayIndex; i > 0; i--) {
    const day = createDayElement(prevLastDate - i + 1, 'other-month');
    calendarDays.appendChild(day);
  }
  
  // Add current month's days
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    if (tempStartDate && date.getTime() === tempStartDate.getTime()) {
      dayEl.classList.add('selected');
    }
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
    if (tempStartDate && tempEndDate && date > tempStartDate && date < tempEndDate) {
      dayEl.classList.add('in-range');
    }
    
    dayEl.addEventListener('click', () => selectDate(date));
    
    calendarDays.appendChild(dayEl);
  }
  
  // Add next month's leading days
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const day = createDayElement(i, 'other-month');
    calendarDays.appendChild(day);
  }
}

/**
 * Create a calendar day element
 * @param {number} dayNumber - Day of the month
 * @param {string} className - CSS class to apply
 * @returns {HTMLElement} Calendar day element
 */
function createDayElement(dayNumber, className) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`;
  dayEl.textContent = dayNumber;
  return dayEl;
}

/**
 * Handle date selection in calendar
 * @param {Date} date - Selected date
 */
function selectDate(date) {
  if (selectingStartDate) {
    tempStartDate = date;
    selectingStartDate = false;
    
    if (tempEndDate && tempEndDate < tempStartDate) {
      tempEndDate = null;
    }
  } else {
    if (date < tempStartDate) {
      tempEndDate = tempStartDate;
      tempStartDate = date;
    } else {
      tempEndDate = date;
    }
    selectingStartDate = true;
  }
  
  updateDateDisplay();
  renderCalendar();
}

/**
 * Update the selected date display boxes
 */
function updateDateDisplay() {
  const startDateEl = document.getElementById("selectedStartDate");
  const endDateEl = document.getElementById("selectedEndDate");
  
  if (!startDateEl || !endDateEl) return;
  
  const formatDateDisplay = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  startDateEl.textContent = formatDateDisplay(tempStartDate);
  endDateEl.textContent = formatDateDisplay(tempEndDate);
  
  startDateEl.parentElement.style.opacity = selectingStartDate ? '1' : '0.6';
  endDateEl.parentElement.style.opacity = selectingStartDate ? '0.6' : '1';
}

/**
 * Change calendar month
 * @param {number} direction - 1 for next month, -1 for previous month
 */
function changeMonth(direction) {
  currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + direction);
  renderCalendar();
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD" 
  }).format(amount);
}

/**
 * Format date string or Date object for display
 * @param {string|Date} dateInput - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Normalize date to midnight local time for consistent comparison
 * @param {string} dateString - ISO date string
 * @returns {Date} Normalized date object
 */
function normalizeDate(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Update text content of an element safely
 * @param {string} id - Element ID
 * @param {string} text - Text content to set
 * @returns {boolean} Success status
 */
function updateElement(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id '${id}' not found`);
    return false;
  }
  el.textContent = text;
  return true;
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}