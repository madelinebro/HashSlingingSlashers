/* ======================================================================
  BloomFi - Dashboard (dashboard.js)
  Author: USER_FIRSTNAME
  Date: 12/12/2025
   ====================================================================== */

// Global state management
let allTransactions = [];
let filteredTransactions = [];
let userData = {};
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
let selectingStartDate = true;
let tempStartDate = null;
let tempEndDate = null;

// Page initialization
document.addEventListener("DOMContentLoaded", async () => {
  // Check login status FIRST
  const isLoggedIn = localStorage.getItem('loggedIn');
  const userName = localStorage.getItem('userName');

  if (!isLoggedIn || !userName) {
    window.location.href = "login.html";
    return;
  }

  try {
    userData = await loadUserData();

    if (!userData) {
      window.location.href = "login.html";
      return;
    }

    allTransactions = Array.isArray(userData.transactions) ? [...userData.transactions] : [];
    filteredTransactions = [...allTransactions];

    initializeGreeting();
    initializeUserProfile();
    calculateAndDisplayBalance();
    renderAccountChips();
    populateAccountDropdown();

    // Default date range
    initializeDateRange();

    // Apply initial filters/render
    applyAllFilters();

    setupEventListeners();
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showErrorState("Failed to load dashboard data. Please try again.");
  }
});

async function loadUserData() {
  try {
    // Toggle mock vs API:
    // - default true for capstone demo
    // - set localStorage.setItem('useMockData','false') to use API
    const useMockData = (localStorage.getItem('useMockData') ?? 'true') === 'true';

    if (useMockData) {
      const storedUserName = localStorage.getItem('userName') || "jeff";

      // NOTE: dates adjusted closer to Dec 2025 so "last 30 days" shows data
      return {
        name: storedUserName,
        accounts: [
          { id: 1, type: "Checking", number: "****3456", balance: 4890.25, color: "teal" },
          { id: 2, type: "Savings", number: "****7890", balance: 3000.20, color: "blue" }
        ],
        transactions: [
          { desc: "Electric Bill", date: "2025-12-08", amount: -120.75, accountId: 1, category: "Bills & Utilities" },
          { desc: "Paycheck", date: "2025-12-05", amount: 2500.00, accountId: 1, category: "Income" },
          { desc: "Grocery Store", date: "2025-12-04", amount: -89.45, accountId: 2, category: "Groceries" },
          { desc: "Streaming Subscription", date: "2025-12-03", amount: -12.99, accountId: 2, category: "Entertainment" },
          { desc: "Coffee Shop", date: "2025-12-02", amount: -5.50, accountId: 1, category: "Food & Drinks" },
          { desc: "Gas Station", date: "2025-11-29", amount: -45.00, accountId: 1, category: "Car & Transportation" },
          { desc: "Restaurant", date: "2025-11-28", amount: -67.89, accountId: 2, category: "Food & Drinks" },
          { desc: "Freelance Payment", date: "2025-11-25", amount: 850.00, accountId: 2, category: "Income" },
          { desc: "Internet Bill", date: "2025-11-20", amount: -79.99, accountId: 1, category: "Bills & Utilities" },
          { desc: "Gym Membership", date: "2025-11-15", amount: -49.99, accountId: 1, category: "Shopping" },
          { desc: "Target", date: "2025-11-14", amount: -124.50, accountId: 2, category: "Shopping" },
          { desc: "Movie Tickets", date: "2025-11-12", amount: -32.00, accountId: 1, category: "Entertainment" },
          { desc: "Uber", date: "2025-11-11", amount: -18.50, accountId: 2, category: "Car & Transportation" },
          { desc: "Whole Foods", date: "2025-11-09", amount: -156.30, accountId: 1, category: "Groceries" },
        ],
        previousPeriod: {
          income: 0,
          expenses: 245.00
        }
      };
    }

    // API mode
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
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

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

function initializeGreeting() {
  const greetingTitle = document.getElementById("greetingTitle");
  if (!greetingTitle) return;

  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  greetingTitle.textContent = `${greeting}, ${userData.name}`;
}

function initializeUserProfile() {
  const userToggleBtn = document.getElementById("userToggle");
  if (!userToggleBtn) return;

  while (userToggleBtn.firstChild) {
    userToggleBtn.removeChild(userToggleBtn.firstChild);
  }

  const nameText = document.createTextNode(userData.name + ' ');
  userToggleBtn.appendChild(nameText);

  const chevron = document.createElement('img');
  chevron.className = 'chev';
  chevron.src = 'images/Chevron left.svg';
  chevron.alt = '';
  userToggleBtn.appendChild(chevron);
}

function calculateAndDisplayBalance() {
  const totalBalanceEl = document.getElementById("totalBalance");
  if (!totalBalanceEl) return;

  const totalBalance = (userData.accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
  totalBalanceEl.textContent = formatCurrency(totalBalance);
}

function renderAccountChips() {
  const accountChipsList = document.getElementById("accountChipsList");
  if (!accountChipsList) return;

  accountChipsList.innerHTML = (userData.accounts || [])
    .map(acc => `
      <div class="account-chip-item">
        <span class="account-dot ${acc.color || ''}"></span>
        <div>
          <div class="chip-label">${acc.type || ''}</div>
          <div class="chip-number">${acc.number || ''}</div>
        </div>
      </div>
    `)
    .join("");
}

function populateAccountDropdown() {
  const filterAccountSelect = document.getElementById("filterAccount");
  if (!filterAccountSelect) return;

  filterAccountSelect.innerHTML = '<option value="all">All Accounts</option>';

  (userData.accounts || []).forEach(acc => {
    const option = document.createElement("option");
    option.value = acc.id;
    option.textContent = `${acc.type} ${acc.number}`;
    filterAccountSelect.appendChild(option);
  });
}

function renderCategorySpendingChart() {
  const chartContainer = document.getElementById("categoryChart");
  if (!chartContainer) return;

  const categoryConfig = {
    'Bills & Utilities': { colorClass: 'bills', icon: '💡' },
    'Shopping': { colorClass: 'shopping', icon: '🛍️' },
    'Car & Transportation': { colorClass: 'transport', icon: '🚗' },
    'Groceries': { colorClass: 'groceries', icon: '🛒' },
    'Food & Drinks': { colorClass: 'food', icon: '🍔' },
    'Entertainment': { colorClass: 'entertainment', icon: '🎬' }
  };

  const categoryTotals = {};
  let totalExpenses = 0;

  filteredTransactions.forEach(t => {
    if (t.amount < 0) {
      const category = t.category || 'Other';
      const amount = Math.abs(t.amount);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalExpenses += amount;
    }
  });

  const categoryData = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses ? (amount / totalExpenses * 100).toFixed(1) : "0.0",
      config: categoryConfig[name] || { colorClass: 'other', icon: '📦' }
    }))
    .sort((a, b) => b.amount - a.amount);

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

  const maxAmount = Math.max(...categoryData.map(c => c.amount));

  categoryData.forEach(category => {
    const barWidth = maxAmount ? (category.amount / maxAmount * 100).toFixed(1) : "0.0";

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

function setupEventListeners() {
  // User menu
  const userToggle = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");

  if (userToggle && userMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = userToggle.getAttribute("aria-expanded") === "true";
      userToggle.setAttribute("aria-expanded", String(!expanded));
      userMenu.style.display = expanded ? "none" : "block";

      const chevron = userToggle.querySelector(".chev");
      if (chevron) chevron.style.transform = expanded ? "rotate(0deg)" : "rotate(-90deg)";
    });

    document.addEventListener("click", () => {
      userToggle.setAttribute("aria-expanded", "false");
      userMenu.style.display = "none";
      const chevron = userToggle.querySelector(".chev");
      if (chevron) chevron.style.transform = "rotate(0deg)";
    });
  }

  // Logout
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) logoutLink.addEventListener("click", handleLogout);

  // Date picker open button (if you have one)
  const openDateBtn = document.getElementById("openDatePickerBtn");
  if (openDateBtn) openDateBtn.addEventListener("click", openDatePicker);

  // Filter modal open button (if you have one)
  const openFilterBtn = document.getElementById("openFilterBtn");
  if (openFilterBtn) openFilterBtn.addEventListener("click", openFilterModal);

  // Apply/Clear filter buttons
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");
  if (applyFiltersBtn) applyFiltersBtn.addEventListener("click", applyFilters);

  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);

  // Date picker buttons
  const applyDateBtn = document.getElementById("applyDateBtn");
  if (applyDateBtn) applyDateBtn.addEventListener("click", applyDateFilter);

  const closeDateBtn = document.getElementById("closeDateBtn");
  if (closeDateBtn) closeDateBtn.addEventListener("click", closeDatePicker);

  // Calendar month nav
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => changeMonth(-1));

  const nextMonthBtn = document.getElementById("nextMonthBtn");
  if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => changeMonth(1));

  // Quick range buttons (optional)
  const quickToday = document.getElementById("quickToday");
  if (quickToday) quickToday.addEventListener("click", () => setQuickFilter('today'));

  const quickWeek = document.getElementById("quickWeek");
  if (quickWeek) quickWeek.addEventListener("click", () => setQuickFilter('week'));

  const quickMonth = document.getElementById("quickMonth");
  if (quickMonth) quickMonth.addEventListener("click", () => setQuickFilter('month'));

  const quickAll = document.getElementById("quickAll");
  if (quickAll) quickAll.addEventListener("click", () => setQuickFilter('all'));

  // Click-outside-to-close modals
  window.addEventListener('click', (e) => {
    const dateModal = document.getElementById("datePickerModal");
    const filterModal = document.getElementById("filterModal");

    if (dateModal && e.target === dateModal) closeDatePicker();
    if (filterModal && e.target === filterModal) closeFilterModal();
  });
}

function handleLogout(e) {
  e.preventDefault();

  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userName");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");

  window.location.href = "login.html";
}

function showErrorState(message) {
  const mainContainer = document.querySelector('.main-container');
  if (!mainContainer) return;

  mainContainer.innerHTML = `
    <div style="text-align: center; padding: 100px; color: white;">
      <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
      <div style="font-size: 1.5rem; margin-bottom: 30px;">${escapeHtml(message)}</div>
      <button onclick="location.reload()"
              style="padding: 15px 30px; font-size: 1.2rem; background: white;
                     color: var(--primary); border: none; border-radius: 10px;
                     cursor: pointer; font-weight: 700;">
        Retry
      </button>
    </div>
  `;
}

function renderTransactions() {
  const txBody = document.getElementById("txBody");
  if (!txBody) return;

  const accountMap = Object.fromEntries(
    (userData.accounts || []).map(a => [a.id, a.number])
  );

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
    updateElement("transactionBadge", 0);
    return;
  }

  txBody.innerHTML = sortedTransactions
    .map(t => `
      <tr>
        <td>${escapeHtml(t.desc || '')}</td>
        <td>${formatDate(t.date)}</td>
        <td class="${t.amount < 0 ? 'neg' : 'pos'}">${formatCurrency(t.amount || 0)}</td>
        <td>${escapeHtml(accountMap[t.accountId] || 'Unknown')}</td>
      </tr>
    `)
    .join("");

  updateElement("transactionBadge", sortedTransactions.length);
}

function initializeDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  currentFilters.startDate = thirtyDaysAgo;
  currentFilters.endDate = today;

  updateDateRangeDisplay();
}

function applyAllFilters() {
  filteredTransactions = allTransactions.filter(transaction => {
    // Date range
    if (currentFilters.startDate || currentFilters.endDate) {
      const txDate = normalizeDate(transaction.date);
      if (currentFilters.startDate && txDate < currentFilters.startDate) return false;
      if (currentFilters.endDate && txDate > currentFilters.endDate) return false;
    }

    // Account
    if (currentFilters.account !== 'all') {
      if (transaction.accountId !== parseInt(currentFilters.account, 10)) return false;
    }

    // Type
    if (currentFilters.type === 'income' && transaction.amount <= 0) return false;
    if (currentFilters.type === 'expense' && transaction.amount >= 0) return false;

    // Amount bounds (absolute)
    const absAmount = Math.abs(transaction.amount || 0);
    if (currentFilters.minAmount !== null && absAmount < currentFilters.minAmount) return false;
    if (currentFilters.maxAmount !== null && absAmount > currentFilters.maxAmount) return false;

    // Search
    if (currentFilters.searchTerm) {
      const hay = String(transaction.desc || '').toLowerCase();
      if (!hay.includes(currentFilters.searchTerm)) return false;
    }

    return true;
  });

  renderTransactions();
  renderCategorySpendingChart();
}

function openFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;

  const filterAccount = document.getElementById("filterAccount");
  const filterType = document.getElementById("filterType");
  const minAmount = document.getElementById("minAmount");
  const maxAmount = document.getElementById("maxAmount");
  const searchDesc = document.getElementById("searchDesc");

  if (filterAccount) filterAccount.value = currentFilters.account;
  if (filterType) filterType.value = currentFilters.type;
  if (minAmount) minAmount.value = currentFilters.minAmount ?? '';
  if (maxAmount) maxAmount.value = currentFilters.maxAmount ?? '';
  if (searchDesc) searchDesc.value = currentFilters.searchTerm ?? '';

  modal.style.display = "flex";
}

function closeFilterModal() {
  const modal = document.getElementById("filterModal");
  if (!modal) return;
  modal.style.display = "none";
}

function applyFilters() {
  const filterAccount = document.getElementById("filterAccount");
  const filterType = document.getElementById("filterType");
  const minAmountEl = document.getElementById("minAmount");
  const maxAmountEl = document.getElementById("maxAmount");
  const searchDescEl = document.getElementById("searchDesc");

  currentFilters.account = filterAccount ? filterAccount.value : 'all';
  currentFilters.type = filterType ? filterType.value : 'all';

  const minAmountValue = minAmountEl ? minAmountEl.value : '';
  const maxAmountValue = maxAmountEl ? maxAmountEl.value : '';

  currentFilters.minAmount = minAmountValue ? parseFloat(minAmountValue) : null;
  currentFilters.maxAmount = maxAmountValue ? parseFloat(maxAmountValue) : null;

  currentFilters.searchTerm = searchDescEl ? String(searchDescEl.value || '').toLowerCase() : '';

  applyAllFilters();
  closeFilterModal();
}

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

  const filterAccount = document.getElementById("filterAccount");
  const filterType = document.getElementById("filterType");
  const minAmountEl = document.getElementById("minAmount");
  const maxAmountEl = document.getElementById("maxAmount");
  const searchDescEl = document.getElementById("searchDesc");

  if (filterAccount) filterAccount.value = 'all';
  if (filterType) filterType.value = 'all';
  if (minAmountEl) minAmountEl.value = '';
  if (maxAmountEl) maxAmountEl.value = '';
  if (searchDescEl) searchDescEl.value = '';

  initializeDateRange();
  applyAllFilters();
}

function openDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;

  tempStartDate = currentFilters.startDate ? new Date(currentFilters.startDate) : null;
  tempEndDate = currentFilters.endDate ? new Date(currentFilters.endDate) : null;
  selectingStartDate = true;

  currentCalendarMonth = tempStartDate ? new Date(tempStartDate) : new Date();
  currentCalendarMonth.setHours(0, 0, 0, 0);

  updateDateDisplay();
  renderCalendar();

  modal.style.display = "flex";
}

function closeDatePicker() {
  const modal = document.getElementById("datePickerModal");
  if (!modal) return;
  modal.style.display = "none";
}

function setQuickFilter(period) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = new Date(today);

  switch (period) {
    case 'today':
      startDate = new Date(today);
      break;
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(today.getDate() - 30);
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

function applyDateFilter() {
  currentFilters.startDate = tempStartDate;
  currentFilters.endDate = tempEndDate;

  updateDateRangeDisplay();
  applyAllFilters();
  closeDatePicker();
}

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

  // Leading days (previous month)
  for (let i = firstDayIndex; i > 0; i--) {
    const day = createDayElement(prevLastDate - i + 1, 'other-month');
    calendarDays.appendChild(day);
  }

  // Current month
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);

    const dayEl = createDayElement(i, '');

    if (date.getTime() === today.getTime()) dayEl.classList.add('today');

    if (tempStartDate && date.getTime() === tempStartDate.getTime()) dayEl.classList.add('selected');
    if (tempEndDate && date.getTime() === tempEndDate.getTime()) dayEl.classList.add('selected');

    if (tempStartDate && tempEndDate && date > tempStartDate && date < tempEndDate) {
      dayEl.classList.add('in-range');
    }

    dayEl.addEventListener('click', () => selectDate(date));
    calendarDays.appendChild(dayEl);
  }

  // Trailing days (next month) to fill 42 cells
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const day = createDayElement(i, 'other-month');
    calendarDays.appendChild(day);
  }
}

function createDayElement(dayNumber, className = '') {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`.trim();
  dayEl.textContent = dayNumber;
  return dayEl;
}

function selectDate(date) {
  if (selectingStartDate) {
    tempStartDate = date;
    selectingStartDate = false;

    if (tempEndDate && tempEndDate < tempStartDate) {
      tempEndDate = null;
    }
  } else {
    if (!tempStartDate) {
      tempStartDate = date;
      selectingStartDate = false;
    } else if (date < tempStartDate) {
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

function updateDateDisplay() {
  const startDateEl = document.getElementById("selectedStartDate");
  const endDateEl = document.getElementById("selectedEndDate");

  if (!startDateEl || !endDateEl) return;

  const formatDateDisplay = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  startDateEl.textContent = formatDateDisplay(tempStartDate);
  endDateEl.textContent = formatDateDisplay(tempEndDate);

  if (startDateEl.parentElement) startDateEl.parentElement.style.opacity = selectingStartDate ? '1' : '0.6';
  if (endDateEl.parentElement) endDateEl.parentElement.style.opacity = selectingStartDate ? '0.6' : '1';
}

function changeMonth(direction) {
  currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + direction);
  renderCalendar();
}

// Helpers
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function normalizeDate(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function updateElement(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id '${id}' not found`);
    return false;
  }
  el.textContent = text;
  return true;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text ?? '');
  return div.innerHTML;
}
