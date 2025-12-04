/* ======================================================================
  BloomFi - Dashboard (dashboard.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Global state management
let allTransactions = []; // All transactions from database
let filteredTransactions = []; // Transactions after applying filters
let userData = {}; // Current user's account data
let currentFilters = {
  startDate: null,
  endDate: null,
  account: 'all',
  type: 'all',
  minAmount: null,
  maxAmount: null,
  searchTerm: ''
};

// Calendar state tracking
let currentCalendarMonth = new Date();
let selectingStartDate = true; // Tracks if we're picking start or end date
let tempStartDate = null;
let tempEndDate = null;

// Page initialization
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load user data from backend or mock data
    userData = await loadUserData();
    
    if (!userData) {
      // No user data means not logged in, redirect to login
      window.location.href = "login.html";
      return;
    }

    // Copy transactions to global state for filtering
    allTransactions = [...userData.transactions];
    filteredTransactions = [...userData.transactions];

    // Set up the page
    initializeGreeting();
    initializeUserProfile();
    calculateAndDisplayBalance();
    renderAccountChips();
    renderCategorySpendingChart(); // NEW: Render the spending chart
    renderTransactions();
    populateAccountDropdown();
    setupEventListeners();
    
    // Default to showing last 30 days
    initializeDateRange();
    
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showErrorState("Failed to load dashboard data. Please try again.");
  }
});

// Data loading functions 
// Loads user data from the backend API or returns mock data for now
// Returns user object with accounts and transactions, or null if not authenticated
async function loadUserData() {
  try {
    // Development mode flag - set to false when backend is ready
    const useMockData = true;
    
    if (useMockData) {
      // Get stored user name or use default
      const storedUserName = localStorage.getItem('userName') || "Jane";
      
      // Check if we have saved profile data in localStorage
      const savedProfileData = localStorage.getItem('userProfileData');
      
      if (savedProfileData) {
        // Use saved profile data if it exists
        const profileData = JSON.parse(savedProfileData);
        
        // Merge profile data with transaction data
        return {
          name: profileData.fullName.split(' ')[0], // Use first name from saved profile
          accounts: [
            { id: 1, type: "Checking", number: "****3456", balance: 4890.25, color: "teal" },
            { id: 2, type: "Savings", number: "****7890", balance: 3000.20, color: "blue" }
          ],
          transactions: [
            { desc: "Electric Bill", date: "2025-10-08", amount: -120.75, accountId: 1, category: "Bills & Utilities" },
            { desc: "Paycheck", date: "2025-10-05", amount: 2500.00, accountId: 1, category: "Income" },
            { desc: "Grocery Store", date: "2025-10-04", amount: -89.45, accountId: 2, category: "Groceries" },
            { desc: "Streaming Subscription", date: "2025-10-03", amount: -12.99, accountId: 2, category: "Entertainment" },
            { desc: "Coffee Shop", date: "2025-10-27", amount: -5.50, accountId: 1, category: "Food & Drinks" },
            { desc: "Gas Station", date: "2025-10-26", amount: -45.00, accountId: 1, category: "Car & Transportation" },
            { desc: "Restaurant", date: "2025-10-25", amount: -67.89, accountId: 2, category: "Food & Drinks" },
            { desc: "Freelance Payment", date: "2025-10-24", amount: 850.00, accountId: 2, category: "Income" },
            { desc: "Internet Bill", date: "2025-10-20", amount: -79.99, accountId: 1, category: "Bills & Utilities" },
            { desc: "Gym Membership", date: "2025-10-15", amount: -49.99, accountId: 1, category: "Shopping" },
            { desc: "Target", date: "2025-10-14", amount: -124.50, accountId: 2, category: "Shopping" },
            { desc: "Movie Tickets", date: "2025-10-12", amount: -32.00, accountId: 1, category: "Entertainment" },
            { desc: "Uber", date: "2025-10-11", amount: -18.50, accountId: 2, category: "Car & Transportation" },
            { desc: "Whole Foods", date: "2025-10-09", amount: -156.30, accountId: 1, category: "Groceries" },
          ],
          previousPeriod: {
            income: 0,
            expenses: 245.00
          },
          // Include full profile data
          fullName: profileData.fullName,
          username: profileData.username,
          email: profileData.email,
          mobile: profileData.mobile
        };
      }
      
      // If no saved data, return defaults using storedUserName
      return {
        name: storedUserName,
        accounts: [
          { id: 1, type: "Checking", number: "****3456", balance: 4890.25, color: "teal" },
          { id: 2, type: "Savings", number: "****7890", balance: 3000.20, color: "blue" }
        ],
        transactions: [
          { desc: "Electric Bill", date: "2025-10-08", amount: -120.75, accountId: 1, category: "Bills & Utilities" },
          { desc: "Paycheck", date: "2025-10-05", amount: 2500.00, accountId: 1, category: "Income" },
          { desc: "Grocery Store", date: "2025-10-04", amount: -89.45, accountId: 2, category: "Groceries" },
          { desc: "Streaming Subscription", date: "2025-10-03", amount: -12.99, accountId: 2, category: "Entertainment" },
          { desc: "Coffee Shop", date: "2025-10-27", amount: -5.50, accountId: 1, category: "Food & Drinks" },
          { desc: "Gas Station", date: "2025-10-26", amount: -45.00, accountId: 1, category: "Car & Transportation" },
          { desc: "Restaurant", date: "2025-10-25", amount: -67.89, accountId: 2, category: "Food & Drinks" },
          { desc: "Freelance Payment", date: "2025-10-24", amount: 850.00, accountId: 2, category: "Income" },
          { desc: "Internet Bill", date: "2025-10-20", amount: -79.99, accountId: 1, category: "Bills & Utilities" },
          { desc: "Gym Membership", date: "2025-10-15", amount: -49.99, accountId: 1, category: "Shopping" },
          { desc: "Target", date: "2025-10-14", amount: -124.50, accountId: 2, category: "Shopping" },
          { desc: "Movie Tickets", date: "2025-10-12", amount: -32.00, accountId: 1, category: "Entertainment" },
          { desc: "Uber", date: "2025-10-11", amount: -18.50, accountId: 2, category: "Car & Transportation" },
          { desc: "Whole Foods", date: "2025-10-09", amount: -156.30, accountId: 1, category: "Groceries" },
        ],
        previousPeriod: {
          income: 0,
          expenses: 245.00
        }
      };
    }
    
    // Production mode - call actual backend API
    // Check if user has authentication token
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
        // Token expired or invalid, clear stored data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Make sure we got valid data back
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

// UI initialization functions
// Sets the greeting message based on time of day
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

// Updates the user's name in the sidebar menu
function initializeUserProfile() {
  const userToggleBtn = document.getElementById("userToggle");
  if (!userToggleBtn) return;

  // Clear existing content
  while (userToggleBtn.firstChild) {
    userToggleBtn.removeChild(userToggleBtn.firstChild);
  }
  
  // Add user's name
  const nameText = document.createTextNode(userData.name + ' ');
  userToggleBtn.appendChild(nameText);
  
  // Add back the dropdown chevron icon
  const chevron = document.createElement('img');
  chevron.className = 'chev';
  chevron.src = 'images/Chevron left.svg';
  chevron.alt = '';
  userToggleBtn.appendChild(chevron);
}

// Calculates total balance across all accounts and displays it
function calculateAndDisplayBalance() {
  const totalBalanceEl = document.getElementById("totalBalance");
  if (!totalBalanceEl) return;

  const totalBalance = userData.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  totalBalanceEl.textContent = formatCurrency(totalBalance);
}

// Creates and displays account chips showing account type and number
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

// Fills the account dropdown in the filter modal with user's accounts
function populateAccountDropdown() {
  const filterAccountSelect = document.getElementById("filterAccount");
  if (!filterAccountSelect) return;

  // Start with "All Accounts" option
  filterAccountSelect.innerHTML = '<option value="all">All Accounts</option>';

  userData.accounts.forEach(acc => {
    const option = document.createElement("option");
    option.value = acc.id;
    option.textContent = `${acc.type} ${acc.number}`;
    filterAccountSelect.appendChild(option);
  });
}

// NEW FUNCTION: Renders the category spending chart
function renderCategorySpendingChart() {
  const chartContainer = document.getElementById("categoryChart");
  if (!chartContainer) return;

  // Define category structure with colors matching your budgeting page
  const categoryConfig = {
    'Bills & Utilities': { colorClass: 'bills', icon: '💡' },
    'Shopping': { colorClass: 'shopping', icon: '🛍️' },
    'Car & Transportation': { colorClass: 'transport', icon: '🚗' },
    'Groceries': { colorClass: 'groceries', icon: '🛒' },
    'Food & Drinks': { colorClass: 'food', icon: '🍔' },
    'Entertainment': { colorClass: 'entertainment', icon: '🎬' }
  };

  // Calculate spending by category from filtered transactions (expenses only)
  const categoryTotals = {};
  let totalExpenses = 0;

  filteredTransactions.forEach(t => {
    // Only count expenses (negative amounts)
    if (t.amount < 0) {
      const category = t.category || 'Other';
      const amount = Math.abs(t.amount);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalExpenses += amount;
    }
  });

  // Convert to array and sort by amount (highest first)
  const categoryData = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / totalExpenses * 100).toFixed(1),
      config: categoryConfig[name] || { colorClass: 'other', icon: '📦' }
    }))
    .sort((a, b) => b.amount - a.amount);

  // Find the maximum amount for scaling bars
  const maxAmount = Math.max(...categoryData.map(c => c.amount));

  // Clear and render chart
  chartContainer.innerHTML = '';

  if (categoryData.length === 0) {
    chartContainer.innerHTML = `
      <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
        <div style="font-size: 3rem; margin-bottom: 15px;">📊</div>
        <div>No expense data available</div>
      </div>
    `;
    return;
  }

  // Create bar chart items
  categoryData.forEach(category => {
    const barWidth = (category.amount / maxAmount * 100).toFixed(1);
    
    const chartItem = document.createElement('div');
    chartItem.className = 'chart-bar-item';
    chartItem.innerHTML = `
      <div class="chart-bar-label">
        <span class="chart-category-name">
          <span class="category-dot ${category.config.colorClass}"></span>
          ${category.name}
        </span>
        <span class="chart-bar-value">${formatCurrency(category.amount)}</span>
      </div>
      <div class="chart-bar-container">
        <div class="chart-bar-fill ${category.config.colorClass}-bar" style="width: ${barWidth}%">
          <span class="chart-bar-percentage">${category.percentage}%</span>
        </div>
      </div>
    `;
    
    chartContainer.appendChild(chartItem);
  });
}

// Attaches all event listeners for interactive elements
function setupEventListeners() {
  // User menu dropdown toggle
  const userToggle = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");
  
  if (userToggle && userMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute("aria-expanded") === "true";
      userToggle.setAttribute("aria-expanded", !expanded);
      userMenu.style.display = expanded ? "none" : "block";
      
      // Rotate chevron icon
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = expanded ? "rotate(0deg)" : "rotate(-90deg)";
      }
    });

    // Close menu when clicking anywhere else on the page
    document.addEventListener("click", () => {
      userToggle.setAttribute("aria-expanded", "false");
      userMenu.style.display = "none";
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = "rotate(0deg)";
      }
    });
  }

  // Logout link functionality
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", handleLogout);
  }

  // Close modals when clicking outside of them
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

// Logs out the user and redirects to login page
function handleLogout(e) {
  e.preventDefault();
  
  // Clear all stored session data
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userName");
  localStorage.removeItem("authToken");
  
  // Send user to login page
  window.location.href = "login.html";
}


// Displays an error message with a retry button
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

// Transaction table rendering
//  Renders the transaction table with filtered and sorted transactions
function renderTransactions() {
  const txBody = document.getElementById("txBody");
  if (!txBody) return;

  // Create a quick lookup map for account numbers
  const accountMap = Object.fromEntries(
    userData.accounts.map(a => [a.id, a.number])
  );

  // Sort by date, newest first
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
  
  // Update transaction badge count
  updateElement("transactionBadge", sortedTransactions.length);
}

// Filter functions
// Sets up the default date range of last 30 days
function initializeDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  currentFilters.startDate = thirtyDaysAgo;
  currentFilters.endDate = today;
  
  updateDateRangeDisplay();
}

// Filters transactions based on all active filters
// Then updates the UI with filtered results
function applyAllFilters() {
  filteredTransactions = allTransactions.filter(transaction => {
    // Filter by date range
    if (currentFilters.startDate || currentFilters.endDate) {
      const txDate = normalizeDate(transaction.date);
      if (currentFilters.startDate && txDate < currentFilters.startDate) return false;
      if (currentFilters.endDate && txDate > currentFilters.endDate) return false;
    }
    
    // Filter by account
    if (currentFilters.account !== 'all') {
      if (transaction.accountId !== parseInt(currentFilters.account)) return false;
    }
    
    // Filter by transaction type (income vs expense)
    if (currentFilters.type === 'income' && transaction.amount <= 0) return false;
    if (currentFilters.type === 'expense' && transaction.amount >= 0) return false;
    
    // Filter by amount range
    const absAmount = Math.abs(transaction.amount);
    if (currentFilters.minAmount !== null && absAmount < currentFilters.minAmount) return false;
    if (currentFilters.maxAmount !== null && absAmount > currentFilters.maxAmount) return false;
    
    // Filter by search term in description
    if (currentFilters.searchTerm && !transaction.desc.toLowerCase().includes(currentFilters.searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  // Refresh the display
  renderTransactions();
  renderCategorySpendingChart(); // Update chart with filtered data
}

// Opens the filter modal and populates it with current filter values
function openFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;
  
  // Pre-fill form with current filters
  document.getElementById("filterAccount").value = currentFilters.account;
  document.getElementById("filterType").value = currentFilters.type;
  document.getElementById("minAmount").value = currentFilters.minAmount || '';
  document.getElementById("maxAmount").value = currentFilters.maxAmount || '';
  document.getElementById("searchDesc").value = currentFilters.searchTerm || '';
  
  modal.style.display = "flex";
}

// Closes the filter modal
function closeFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;
  modal.style.display = "none";
}

// Saves filter selections from modal and applies them
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

// Resets all filters to their default values
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
  
  // Reset form fields to defaults
  document.getElementById("filterAccount").value = 'all';
  document.getElementById("filterType").value = 'all';
  document.getElementById("minAmount").value = '';
  document.getElementById("maxAmount").value = '';
  document.getElementById("searchDesc").value = '';
  
  initializeDateRange(); // Back to last 30 days
  applyAllFilters();
}

// Date picker functions
// Opens the date picker modal and initializes calendar
function openDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;
  
  // Store current dates as temporary while user makes selection
  tempStartDate = currentFilters.startDate;
  tempEndDate = currentFilters.endDate;
  selectingStartDate = true;
  
  currentCalendarMonth = tempStartDate ? new Date(tempStartDate) : new Date();
  
  updateDateDisplay();
  renderCalendar();
  
  modal.style.display = "flex";
}

// Closes the date picker modal
function closeDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;
  modal.style.display = "none";
}

// Sets date range based on quick filter buttons (today, week, month, all)
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

// Applies the selected date range and closes modal
function applyDateFilter() {
  currentFilters.startDate = tempStartDate;
  currentFilters.endDate = tempEndDate;
  
  updateDateRangeDisplay();
  applyAllFilters();
  closeDatePicker();
}

// Updates the date range text shown in the header
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

// Calendar rendering and interaction
// Renders the monthly calendar view with selectable dates
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
  
  // Add trailing days from previous month
  for (let i = firstDayIndex; i > 0; i--) {
    const day = createDayElement(prevLastDate - i + 1, 'other-month');
    calendarDays.appendChild(day);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    // Highlight today's date
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    // Mark selected start and end dates
    if (tempStartDate && date.getTime() === tempStartDate.getTime()) {
      dayEl.classList.add('selected');
    }
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
    // Highlight dates in between start and end
    if (tempStartDate && tempEndDate && date > tempStartDate && date < tempEndDate) {
      dayEl.classList.add('in-range');
    }
    
    dayEl.addEventListener('click', () => selectDate(date));
    
    calendarDays.appendChild(dayEl);
  }
  
  // Add leading days from next month to fill calendar grid
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells; // 6 rows x 7 days = 42 cells
  for (let i = 1; i <= remainingCells; i++) {
    const day = createDayElement(i, 'other-month');
    calendarDays.appendChild(day);
  }
}

// Creates a single calendar day element
function createDayElement(dayNumber, className) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`;
  dayEl.textContent = dayNumber;
  return dayEl;
}


// Handles clicking a date in the calendar
// First click selects start date, second click selects end date
function selectDate(date) {
  if (selectingStartDate) {
    tempStartDate = date;
    selectingStartDate = false;
    
    // Clear end date if it's before new start date
    if (tempEndDate && tempEndDate < tempStartDate) {
      tempEndDate = null;
    }
  } else {
    // If clicked date is before start, swap them
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


//  Updates the date selection display boxes above calendar
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
  
  // Dim the box that's not currently being selected
  startDateEl.parentElement.style.opacity = selectingStartDate ? '1' : '0.6';
  endDateEl.parentElement.style.opacity = selectingStartDate ? '0.6' : '1';
}


// Changes the calendar to next or previous month
function changeMonth(direction) {
  currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + direction);
  renderCalendar();
}

// Utility functions
// Formats a number as US currency (e.g., $1,234.56)
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD" 
  }).format(amount);
}


// Formats a date in readable format (e.g., "Oct 15, 2025")
function formatDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}


// Converts date string to midnight local time for accurate date comparisons
function normalizeDate(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}


// Safely updates an element's text content
// Logs a warning if element doesn't exist
function updateElement(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id '${id}' not found`);
    return false;
  }
  el.textContent = text;
  return true;
}


// Escapes HTML characters 
// Converts user input to safe display text
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}