/* ======================================================================
  BloomFi - Budgeting (budgeting.js)
  Incorporates functionality for monthly, weekly, and yearly views
  Connected to FastAPI Backend
  Author: Samantha Saunsaucie 
  Date: Updated 12/05/2025
   ====================================================================== */

// ============================================
// DOM READY INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // API Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // ============================================
  // API HELPER FUNCTIONS
  // ============================================

  /**
   * Fetch budgets from the backend
   */
  async function fetchBudgets(period = null) {
    try {
      let url = `${API_BASE_URL}/budgets`;
      
      // Add query parameters if period is specified
      if (period) {
        url += `?period=${period}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch budgets: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showNotification('⚠️ Failed to load budget data', 'error');
      return [];
    }
  }

  /**
   * Fetch transactions from the backend with optional filters
   */
  async function fetchTransactions(startDate = null, endDate = null, category = null) {
    try {
      let url = `${API_BASE_URL}/transactions`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (category) params.append('category', category);
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showNotification('⚠️ Failed to load transaction data', 'error');
      return [];
    }
  }

  /**
   * Create or update a budget
   */
  async function saveBudgetToBackend(budgetData) {
    try {
      const method = budgetData.budget_id ? 'PUT' : 'POST';
      const url = budgetData.budget_id 
        ? `${API_BASE_URL}/budgets/${budgetData.budget_id}` 
        : `${API_BASE_URL}/budgets`;
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save budget: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving budget:', error);
      showNotification('⚠️ Failed to save budget', 'error');
      return null;
    }
  }

  // ============================================
  // MONTHLY BUDGET FUNCTIONS
  // ============================================
  
  //  User Menu Toggle (Works on all pages) 
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

    document.addEventListener("click", () => {
      userToggle.setAttribute("aria-expanded", "false");
      userMenu.style.display = "none";
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = "rotate(0deg)";
      }
    });
  }

  // Log Out Functionality
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='index.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      
      window.location.href = "index.html";
    });
  }

  // Budget View Navigation Tabs
  const budgetTabs = document.querySelectorAll('.budget-tab-btn');

  if (budgetTabs.length > 0) {
    budgetTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
      
        const period = tab.getAttribute('data-period');
      
        if (period) {
          let targetPage = '';
          if (period === 'week') {
            targetPage = 'budgeting_week.html';
          } else if (period === 'month') {
            targetPage = 'budgeting_month.html';
          } else if (period === 'year') {
            targetPage = 'budgeting_year.html';
          }
        
          if (targetPage) {
            window.location.href = targetPage;
          }
        }
      });
    });
  }
  
  // Initialize the appropriate budget page based on current URL
  if (window.location.pathname.includes('budgeting_month')) {
    initMonthlyBudget();
  }

  if (window.location.pathname.includes('budgeting_week')) {
    initWeeklyBudget();
  }

  if (window.location.pathname.includes('budgeting_year')) {
    initYearlyBudget();
  }
});

// ============================================
// API HELPER FUNCTIONS
// ============================================

/**
 * Fetch budgets from the backend
 */
async function fetchBudgets(period = null) {
  try {
    let url = API_ENDPOINTS.budgets;
    
    // Add query parameters if period is specified
    if (period) {
      url += `?period=${period}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch budgets: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching budgets:', error);
    showNotification('⚠️ Failed to load budget data', 'error');
    return [];
  }
}

/**
 * Fetch transactions from the backend with optional filters
 */
async function fetchTransactions(startDate = null, endDate = null, category = null) {
  try {
    let url = API_ENDPOINTS.transactions;
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    showNotification('⚠️ Failed to load transaction data', 'error');
    return [];
  }
}

/**
 * Create or update a budget
 */
async function saveBudgetToBackend(budgetData) {
  try {
    const method = budgetData.id ? 'PUT' : 'POST';
    const url = budgetData.id 
      ? `${API_ENDPOINTS.budgets}/${budgetData.id}` 
      : API_ENDPOINTS.budgets;
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(budgetData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save budget: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving budget:', error);
    showNotification('⚠️ Failed to save budget', 'error');
    return null;
  }
}

// ============================================
// MONTHLY BUDGET FUNCTIONS
// ============================================
async function initMonthlyBudget() {
  console.log('Initializing Monthly Budget Page...');
  
  // Load budget data from backend
  const budgetData = await loadMonthlyBudgetData();
  renderMonthlyBudget(budgetData);
  
  // Budget form submission
  const budgetForm = document.getElementById('budgetForm');
  
  if (budgetForm) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveMonthlyBudget();
    });

    // Real-time calculation
    const inputs = budgetForm.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        calculateAndUpdateMonthlyTotals();
      });
    });
  }

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm('Reset to default values?')) {
        localStorage.removeItem('monthlyBudget');
        const defaultData = await loadMonthlyBudgetData();
        renderMonthlyBudget(defaultData);
        showNotification('ℹ️ Budget reset to defaults', 'info');
      }
    });
  }
}

/**
 * Load monthly budget data from backend
 * Combines budget settings with actual spending from transactions
 */
async function loadMonthlyBudgetData() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // Get the first and last day of current month
  const startDate = new Date(currentYear, currentDate.getMonth(), 1).toISOString().split('T')[0];
  const endDate = new Date(currentYear, currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Fetch budgets and transactions in parallel
  const [budgets, transactions] = await Promise.all([
    fetchBudgets('monthly'),
    fetchTransactions(startDate, endDate)
  ]);
  
  // Process budget data
  const budgetData = {
    totalBudget: 0,
    categories: [],
    month: currentDate.toLocaleDateString('en-US', { month: 'long' }),
    year: currentYear
  };
  
  // Define category mappings
  const categoryMap = {
    'bills': { name: 'Bills & Utilities', icon: '💡', colorClass: 'bills' },
    'shopping': { name: 'Shopping', icon: '🛍️', colorClass: 'shopping' },
    'car': { name: 'Car & Transportation', icon: '🚗', colorClass: 'transport' },
    'groceries': { name: 'Groceries', icon: '🛒', colorClass: 'groceries' },
    'food': { name: 'Food & Drinks', icon: '🍔', colorClass: 'food' },
    'entertainment': { name: 'Entertainment', icon: '🎬', colorClass: 'entertainment' }
  };
  
  // Calculate spending by category from transactions
  const spendingByCategory = {};
  transactions.forEach(transaction => {
    const category = transaction.category || 'other';
    if (!spendingByCategory[category]) {
      spendingByCategory[category] = 0;
    }
    spendingByCategory[category] += Math.abs(transaction.amount);
  });
  
  // Build categories array
  Object.keys(categoryMap).forEach(categoryId => {
    const categoryInfo = categoryMap[categoryId];
    const budget = budgets.find(b => b.category === categoryId);
    
    budgetData.categories.push({
      id: categoryId,
      budget_id: budget ? budget.budget_id : null, // Store backend ID for updates
      name: categoryInfo.name,
      budgeted: budget ? budget.amount : 0,
      spent: spendingByCategory[categoryId] || 0,
      icon: categoryInfo.icon,
      colorClass: categoryInfo.colorClass
    });
    
    budgetData.totalBudget += (budget ? budget.amount : 0);
  });
  
  return budgetData;
}

// Render monthly budget to the page
function renderMonthlyBudget(budgetData) {
  // Update month display
  const currentMonthEl = document.getElementById('currentMonth');
  if (currentMonthEl) {
    currentMonthEl.textContent = budgetData.month || 'Current Month';
  }
  
  // Calculate totals
  const totalSpent = budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudgeted = budgetData.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const remaining = budgetData.totalBudget - totalSpent;
  
  // Update Summary statistics
  const totalSpentEl = document.getElementById('totalSpent');
  const remainingBudgetEl = document.getElementById('remainingBudget');
  
  if (totalSpentEl) {
    totalSpentEl.textContent = formatCurrency(totalSpent);
  }
  if (remainingBudgetEl) {
    remainingBudgetEl.textContent = formatCurrency(remaining);
  }
  
  // Render components
  renderCategoryTable(budgetData);
  renderBudgetForm(budgetData);
}

// Render category breakdown table
function renderCategoryTable(budgetData) {
  const tbody = document.getElementById('categoryTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  budgetData.categories.forEach(category => {
    const percentage = calculatePercentage(category.spent, budgetData.totalBudget);
    const status = getSpendingStatus(category.spent, category.budgeted);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="category-dot ${category.colorClass}"></span>${category.name}</td>
      <td class="amount">${formatCurrency(category.spent)}</td>
      <td>${percentage}%</td>
      <td><span class="status-badge ${status.class}">${status.label}</span></td>
    `;
    
    tbody.appendChild(row);
  });
}

// Render the budget form inputs
function renderBudgetForm(budgetData) {
  const formGrid = document.getElementById('budgetFormGrid');
  if (!formGrid) return;
  
  formGrid.innerHTML = '';
  
  // Total Monthly budget input
  const totalBudgetGroup = document.createElement('div');
  totalBudgetGroup.className = 'budget-form-group total-budget';
  totalBudgetGroup.innerHTML = `
    <label for="monthlySpend">
      <span class="label-icon">💰</span>
      Total Monthly Budget
    </label>
    <input type="number" id="monthlySpend" value="${budgetData.totalBudget}" min="0" step="1">
  `;
  formGrid.appendChild(totalBudgetGroup);
  
  // Category budget inputs
  budgetData.categories.forEach(category => {
    const formGroup = document.createElement('div');
    formGroup.className = 'budget-form-group';
    formGroup.innerHTML = `
      <label for="${category.id}">
        <span class="category-dot ${category.colorClass}"></span>
        ${category.name}
      </label>
      <input type="number" id="${category.id}" value="${category.budgeted}" min="0" step="1" data-category-id="${category.id}">
    `;
    formGrid.appendChild(formGroup);
  });
  
  // Attach event listeners
  const inputs = formGrid.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('input', calculateAndUpdateMonthlyTotals);
  });
  
  calculateAndUpdateMonthlyTotals();
}

// Calculate and update monthly totals with visual feedback
function calculateAndUpdateMonthlyTotals() {
  const monthlySpendInput = document.getElementById('monthlySpend');
  const totalBudget = parseFloat(monthlySpendInput?.value) || 0;
  
  // Calculate total allocated budget
  let totalAllocated = 0;
  const categoryInputs = document.querySelectorAll('input[data-category-id]');
  categoryInputs.forEach(input => {
    totalAllocated += parseFloat(input.value) || 0;
  });
  
  const remaining = totalBudget - totalAllocated;
  
  // Visual feedback for total budget input
  if (monthlySpendInput) {
    if (totalAllocated > totalBudget) {
      monthlySpendInput.style.borderColor = '#ef4444';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
    } 
    else if (remaining < totalBudget * 0.1) {
      monthlySpendInput.style.borderColor = '#f59e0b';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    } 
    else {
      monthlySpendInput.style.borderColor = '#10b981';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
    }
  }
}

// Save monthly budget to backend
async function saveMonthlyBudget() {
  const monthlySpendInput = document.getElementById('monthlySpend');
  const totalBudget = parseFloat(monthlySpendInput?.value) || 0;
  
  // Get current budget data to access budget_ids
  const currentBudgetData = await loadMonthlyBudgetData();
  
  // Collect category budgets
  const categoryBudgets = [];
  let totalAllocated = 0;
  
  const categoryInputs = document.querySelectorAll('input[data-category-id]');
  categoryInputs.forEach(input => {
    const categoryId = input.getAttribute('data-category-id');
    const amount = parseFloat(input.value) || 0;
    
    // Find the existing budget for this category (if it exists)
    const existingCategory = currentBudgetData.categories.find(c => c.id === categoryId);
    
    const budgetPayload = {
      category: categoryId,
      amount: amount,
      period: 'monthly'
    };
    
    // If updating existing budget, include the budget_id
    if (existingCategory && existingCategory.budget_id) {
      budgetPayload.budget_id = existingCategory.budget_id;
    }
    
    categoryBudgets.push(budgetPayload);
    totalAllocated += amount;
  });
  
  // Validation
  if (totalAllocated > totalBudget) {
    showNotification(
      `⚠️ Warning: Total allocated (${formatCurrency(totalAllocated)}) exceeds monthly budget (${formatCurrency(totalBudget)})!`, 
      'warning'
    );
    return;
  }
  
  // Save each category budget to backend
  const savePromises = categoryBudgets.map(budget => saveBudgetToBackend(budget));
  
  try {
    await Promise.all(savePromises);
    showNotification('✅ Budget updated successfully!', 'success');
    
    // Reload data to reflect changes
    const updatedData = await loadMonthlyBudgetData();
    renderMonthlyBudget(updatedData);
  } catch (error) {
    console.error('Error saving budgets:', error);
    showNotification('⚠️ Failed to save budget', 'error');
  }
}

// Determine spending status based on actual vs. budgeted
function getSpendingStatus(spent, budgeted) {
  if (budgeted === 0) {
    return { class: 'under-budget', label: 'No Budget' };
  }
  
  const percentUsed = (spent / budgeted) * 100;
  
  if (percentUsed >= 100) {
    return { class: 'over-budget', label: 'Over Budget' };
  } else if (percentUsed >= 80) {
    return { class: 'on-track', label: 'On Track' };
  } else {
    return { class: 'under-budget', label: 'Under Budget' };
  }
}

// ============================================
// WEEKLY BUDGET FUNCTIONS
// ============================================
async function initWeeklyBudget() {
  console.log('Initializing Weekly Budget Page...');
  
  const weeklyData = await loadWeeklyBudgetData();
  renderWeeklyBudget(weeklyData);
  
  // Week navigation buttons
  const prevWeekBtn = document.getElementById('prevWeekBtn');
  const nextWeekBtn = document.getElementById('nextWeekBtn');
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      navigateWeek(-1);
      showNotification('⬅️ Loading previous week...', 'info');
    });
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      navigateWeek(1);
      showNotification('➡️ Loading next week...', 'info');
    });
  }

  console.log('Weekly budget initialized successfully!');
}

/**
 * Load weekly budget data from backend
 */
async function loadWeeklyBudgetData(weekOffset = 0) {
  // Calculate the week dates based on offset
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - daysToMonday + (weekOffset * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const startDateISO = weekStart.toISOString().split('T')[0];
  const endDateISO = weekEnd.toISOString().split('T')[0];
  
  // Fetch transactions for the week
  const transactions = await fetchTransactions(startDateISO, endDateISO);
  
  // Fetch weekly budgets
  const budgets = await fetchBudgets('weekly');
  
  // Calculate weekly budget total
  const weeklyBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  
  // Calculate total spent
  const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Build daily data
  const dailyData = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    const dayDateISO = dayDate.toISOString().split('T')[0];
    
    // Filter transactions for this day
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      return tDate === dayDateISO;
    });
    
    const dayAmount = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Find top category for the day
    const categoryTotals = {};
    dayTransactions.forEach(t => {
      const cat = t.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
    });
    
    const topCategoryId = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, 'other'
    );
    
    const categoryMap = {
      'bills': { name: 'Bills & Utilities', colorClass: 'bills' },
      'shopping': { name: 'Shopping', colorClass: 'shopping' },
      'car': { name: 'Transportation', colorClass: 'transport' },
      'groceries': { name: 'Groceries', colorClass: 'groceries' },
      'food': { name: 'Food & Drinks', colorClass: 'food' },
      'entertainment': { name: 'Entertainment', colorClass: 'entertainment' },
      'other': { name: 'Other', colorClass: 'other' }
    };
    
    const topCategoryInfo = categoryMap[topCategoryId] || categoryMap['other'];
    
    dailyData.push({
      day: daysOfWeek[i],
      date: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateISO: dayDateISO,
      amount: dayAmount,
      transactions: dayTransactions.length,
      topCategory: {
        name: topCategoryInfo.name,
        amount: categoryTotals[topCategoryId] || 0,
        colorClass: topCategoryInfo.colorClass
      },
      isToday: dayDateISO === new Date().toISOString().split('T')[0]
    });
  }
  
  // Build category data
  const categorySpending = {};
  transactions.forEach(t => {
    const cat = t.category || 'other';
    categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(t.amount);
  });
  
  const categoryData = [];
  const categoryMap = {
    'groceries': { name: 'Groceries', colorClass: 'groceries' },
    'food': { name: 'Food & Drinks', colorClass: 'food' },
    'shopping': { name: 'Shopping', colorClass: 'shopping' },
    'car': { name: 'Transportation', colorClass: 'transport' },
    'entertainment': { name: 'Entertainment', colorClass: 'entertainment' },
    'bills': { name: 'Bills & Utilities', colorClass: 'bills' }
  };
  
  Object.keys(categoryMap).forEach(catId => {
    const budget = budgets.find(b => b.category === catId);
    categoryData.push({
      id: catId,
      name: categoryMap[catId].name,
      spent: categorySpending[catId] || 0,
      budget: budget ? budget.amount : 0,
      colorClass: categoryMap[catId].colorClass
    });
  });
  
  // Generate insights
  const insights = [];
  const remaining = weeklyBudget - totalSpent;
  
  if (remaining > 0) {
    insights.push({
      type: 'success',
      icon: '✓',
      title: 'Great Job!',
      message: "You're on track to stay under budget this week"
    });
  } else {
    insights.push({
      type: 'warning',
      icon: '⚠',
      title: 'Over Budget',
      message: `You've exceeded your weekly budget by ${formatCurrency(Math.abs(remaining))}`
    });
  }
  
  // Find highest spending day
  const maxDaySpending = Math.max(...dailyData.map(d => d.amount));
  const highestDay = dailyData.find(d => d.amount === maxDaySpending);
  
  if (highestDay && maxDaySpending > 0) {
    insights.push({
      type: 'suggestion',
      icon: '💡',
      title: 'Smart Tip',
      message: `${highestDay.day} was your highest spending day at ${formatCurrency(maxDaySpending)}`
    });
  }
  
  return {
    weekStart: startDateISO,
    weekEnd: endDateISO,
    weekLabel: weekOffset === 0 ? 'Current Week' : 
               weekOffset === -1 ? 'Last Week' : 
               weekOffset === 1 ? 'Next Week' : 
               weekOffset < 0 ? `${Math.abs(weekOffset)} Weeks Ago` : 
               `${weekOffset} Weeks Ahead`,
    weeklyBudget: weeklyBudget,
    totalSpent: totalSpent,
    lastWeekSpent: 0, // Could calculate from previous week if needed
    dailyData: dailyData,
    categoryData: categoryData,
    insights: insights
  };
}

// Navigate to a different week
async function navigateWeek(offset) {
  let currentOffset = parseInt(localStorage.getItem('currentWeekOffset') || '0');
  currentOffset += offset;
  localStorage.setItem('currentWeekOffset', currentOffset.toString());
  
  const weeklyData = await loadWeeklyBudgetData(currentOffset);
  renderWeeklyBudget(weeklyData);
}

// Render the weekly budget to the page
function renderWeeklyBudget(weeklyData) {
  // Update week header
  const weekLabelEl = document.getElementById('weekLabel');
  const weekDatesEl = document.getElementById('weekDates');
  
  if (weekLabelEl) {
    weekLabelEl.textContent = weeklyData.weekLabel;
  }
  if (weekDatesEl) {
    weekDatesEl.textContent = formatWeekDateRange(weeklyData.weekStart, weeklyData.weekEnd);
  }
  
  // Calculate statistics
  const dailyAverage = weeklyData.totalSpent / 7;
  const remaining = weeklyData.weeklyBudget - weeklyData.totalSpent;
  const percentRemaining = weeklyData.weeklyBudget > 0 
    ? ((remaining / weeklyData.weeklyBudget) * 100).toFixed(0) 
    : 0;
  const spendingDiff = weeklyData.totalSpent - weeklyData.lastWeekSpent;
  
  // Render all the components
  renderWeeklyOverviewCards(weeklyData.totalSpent, dailyAverage, remaining, percentRemaining, spendingDiff);
  renderDailyBreakdown(weeklyData.dailyData);
  renderWeeklyCategoryBreakdown(weeklyData.categoryData);
  renderWeeklyInsights(weeklyData.insights);
}

// Render weekly overview statistics cards
function renderWeeklyOverviewCards(totalSpent, dailyAverage, remaining, percentRemaining, spendingDiff) {
  const overviewGrid = document.getElementById('weeklyOverviewGrid');
  if (!overviewGrid) return;
  
  let trendClass = 'neutral';
  let trendText = 'Similar to usual';
  
  if (spendingDiff < -20) {
    trendClass = 'down';
    trendText = `↓ ${formatCurrency(Math.abs(spendingDiff))} from last week`;
  } else if (spendingDiff > 20) {
    trendClass = 'up';
    trendText = `↑ ${formatCurrency(spendingDiff)} from last week`;
  }
  
  overviewGrid.innerHTML = `
    <div class="weekly-stat-card spent">
        <div class="weekly-stat-header">
            <span class="weekly-stat-icon">💸</span>
            <span class="weekly-stat-label">Spent This Week</span>
        </div>
        <div class="weekly-stat-value">${formatCurrency(totalSpent)}</div>
        <div class="weekly-stat-footer">
            <span class="weekly-trend ${trendClass}">${trendText}</span>
        </div>
    </div>
    <div class="weekly-stat-card average">
        <div class="weekly-stat-header">
            <span class="weekly-stat-icon">📊</span>
            <span class="weekly-stat-label">Daily Average</span>
        </div>
        <div class="weekly-stat-value">${formatCurrency(dailyAverage)}</div>
        <div class="weekly-stat-footer">
            <span class="weekly-trend neutral">Based on 7 days</span>
        </div>
    </div>
    <div class="weekly-stat-card remaining">
        <div class="weekly-stat-header">
            <span class="weekly-stat-icon">💰</span>
            <span class="weekly-stat-label">Weekly Budget Left</span>
        </div>
        <div class="weekly-stat-value">${formatCurrency(remaining)}</div>
        <div class="weekly-stat-footer">
            <span class="weekly-progress-text">${percentRemaining}% remaining</span>
        </div>
    </div>
  `;
}

// Render daily spending breakdown
function renderDailyBreakdown(dailyData) {
  const daysGrid = document.getElementById('daysGrid');
  if (!daysGrid) return;
  
  daysGrid.innerHTML = '';
  
  const maxAmount = Math.max(...dailyData.map(d => d.amount), 1);
  
  dailyData.forEach(dayData => {
    const barWidth = ((dayData.amount / maxAmount) * 100).toFixed(0);
    
    const todayClass = dayData.isToday ? 'today' : '';
    const barFillClass = dayData.isToday ? 'today-fill' : '';
    const dateDisplay = dayData.isToday ? `${dayData.date} • Today` : dayData.date;
    
    const dayCard = document.createElement('div');
    dayCard.className = `day-card ${todayClass}`;
    dayCard.innerHTML = `
      <div class="day-header">
          <span class="day-name">${dayData.day}</span>
          <span class="day-date">${dateDisplay}</span>
      </div>
      <div class="day-amount">${formatCurrency(dayData.amount)}</div>
      <div class="day-transactions">${dayData.transactions} transaction${dayData.transactions !== 1 ? 's' : ''}</div>
      <div class="day-bar">
          <div class="day-bar-fill ${barFillClass}" style="width: ${barWidth}%"></div>
      </div>
      <div class="day-top-category">
          <span class="category-dot ${dayData.topCategory.colorClass}"></span>
          ${dayData.topCategory.name}: ${formatCurrency(dayData.topCategory.amount)}
      </div>
    `;
    
    daysGrid.appendChild(dayCard);
  });
}

// Render weekly category breakdown
function renderWeeklyCategoryBreakdown(categoryData) {
  const categoryGrid = document.getElementById('categoryBreakdownGrid');
  if (!categoryGrid) return;
  
  categoryGrid.innerHTML = '';
  
  categoryData.forEach(category => {
    const percentUsed = category.budget > 0 
      ? ((category.spent / category.budget) * 100).toFixed(0) 
      : 0;
    const remaining = category.budget - category.spent;
    
    const budgetText = remaining >= 0 
      ? `${formatCurrency(remaining)} under budget` 
      : `${formatCurrency(Math.abs(remaining))} over budget`;
    
    const categoryItem = document.createElement('div');
    categoryItem.className = 'category-breakdown-item';
    categoryItem.innerHTML = `
      <div class="category-breakdown-header">
          <span class="category-dot ${category.colorClass}"></span>
          <span class="category-breakdown-name">${category.name}</span>
          <span class="category-breakdown-amount">${formatCurrency(category.spent)}</span>
      </div>
      <div class="category-progress-bar">
          <div class="category-progress-fill ${category.colorClass}-fill" style="width: ${percentUsed}%"></div>
      </div>
      <div class="category-budget-info">${budgetText}</div>
    `;
    
    categoryGrid.appendChild(categoryItem);
  });
}

// Render weekly insights section
function renderWeeklyInsights(insights) {
  const tipsGrid = document.getElementById('tipsGrid');
  if (!tipsGrid) return;
  
  tipsGrid.innerHTML = '';
  
  insights.forEach(insight => {
    const tipItem = document.createElement('div');
    tipItem.className = `tip-item ${insight.type}`;
    tipItem.innerHTML = `
      <div class="tip-icon">${insight.icon}</div>
      <div class="tip-content">
          <strong>${insight.title}</strong>
          <p>${insight.message}</p>
      </div>
    `;
    
    tipsGrid.appendChild(tipItem);
  });
}

// Format week range for display
function formatWeekDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const year = end.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

// ============================================
// YEARLY BUDGET FUNCTIONS
// ============================================

async function initYearlyBudget() {
  console.log('Initializing Yearly Budget Page...');
  
  const yearlyData = await loadYearlyBudgetData();
  renderYearlyBudget(yearlyData);
  
  // Year navigation buttons
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  
  if (prevYearBtn) {
    prevYearBtn.addEventListener('click', async () => {
      const currentYear = parseInt(document.getElementById('currentYear')?.textContent) || new Date().getFullYear();
      const newYear = currentYear - 1;
      await loadAndRenderYear(newYear);
      showNotification(`⬅️ Loading ${newYear} data...`, 'info');
    });
  }
  
  if (nextYearBtn) {
    nextYearBtn.addEventListener('click', async () => {
      const currentYear = parseInt(document.getElementById('currentYear')?.textContent) || new Date().getFullYear();
      const newYear = currentYear + 1;
      await loadAndRenderYear(newYear);
      showNotification(`➡️ Loading ${newYear} data...`, 'info');
    });
  }

  console.log('Yearly budget initialized successfully!');
}

/**
 * Load yearly budget data from backend
 */
async function loadYearlyBudgetData(year = null) {
  const targetYear = year || new Date().getFullYear();
  
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;
  
  // Fetch transactions for the entire year
  const transactions = await fetchTransactions(startDate, endDate);
  
  // Fetch budgets
  const budgets = await fetchBudgets('yearly');
  
  const totalYearlyBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  
  // Calculate spending by category
  const categorySpending = {};
  transactions.forEach(t => {
    const cat = t.category || 'other';
    categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(t.amount);
  });
  
  // Build categories array
  const categoryMap = {
    'bills': { name: 'Bills & Utilities', colorClass: 'bills' },
    'shopping': { name: 'Shopping', colorClass: 'shopping' },
    'car': { name: 'Car & Transportation', colorClass: 'transport' },
    'groceries': { name: 'Groceries', colorClass: 'groceries' },
    'food': { name: 'Food & Drinks', colorClass: 'food' },
    'entertainment': { name: 'Entertainment', colorClass: 'entertainment' }
  };
  
  const categories = Object.keys(categoryMap).map(catId => {
    const annualAmount = categorySpending[catId] || 0;
    const monthlyAvg = annualAmount / 12;
    
    return {
      id: catId,
      name: categoryMap[catId].name,
      annualAmount: annualAmount,
      monthlyAvg: monthlyAvg,
      colorClass: categoryMap[catId].colorClass,
      trend: { type: 'stable', value: 0, label: 'Stable' }
    };
  });
  
  // Build monthly data
  const currentMonth = new Date().getMonth();
  const monthlyData = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(targetYear, i, 1).toISOString().split('T')[0];
    const monthEnd = new Date(targetYear, i + 1, 0).toISOString().split('T')[0];
    
    const monthTransactions = transactions.filter(t => {
      const tDate = t.date;
      return tDate >= monthStart && tDate <= monthEnd;
    });
    
    const monthAmount = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    monthlyData.push({
      month: months[i],
      amount: monthAmount,
      isProjected: targetYear === new Date().getFullYear() && i > currentMonth
    });
  }
  
  // Generate insights
  const totalSpent = categories.reduce((sum, cat) => sum + cat.annualAmount, 0);
  const remaining = totalYearlyBudget - totalSpent;
  
  const insights = [];
  
  if (remaining > 0) {
    const monthsRemaining = 12 - currentMonth - 1;
    const percentRemaining = ((remaining / totalYearlyBudget) * 100).toFixed(0);
    insights.push({
      type: 'positive',
      icon: '✓',
      title: 'On Track',
      message: `You're ${percentRemaining}% under your annual budget with ${monthsRemaining} months remaining`
    });
  }
  
  return {
    year: targetYear,
    totalYearlyBudget: totalYearlyBudget,
    categories: categories,
    monthlyData: monthlyData,
    insights: insights
  };
}

// Load and render specified year
async function loadAndRenderYear(year) {
  const yearlyData = await loadYearlyBudgetData(year);
  renderYearlyBudget(yearlyData);
}

// Render the yearly budget to the page
function renderYearlyBudget(yearlyData) {
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = yearlyData.year;
  }
  
  const totalSpent = yearlyData.categories.reduce((sum, cat) => sum + cat.annualAmount, 0);
  const remaining = yearlyData.totalYearlyBudget - totalSpent;
  const avgMonthly = totalSpent / 12;
  
  renderYearlyOverviewCards(totalSpent, remaining, avgMonthly, yearlyData.year);
  renderYearlyCategoryTable(yearlyData, totalSpent);
  renderMonthlyBreakdown(yearlyData.monthlyData);
  renderInsights(yearlyData.insights);
}

// Render yearly overview statistics cards
function renderYearlyOverviewCards(totalSpent, remaining, avgMonthly, year) {
  const overviewGrid = document.getElementById('yearlyOverviewGrid');
  if (!overviewGrid) return;
  
  const totalBudget = totalSpent + remaining;
  const percentRemaining = totalBudget > 0 
    ? ((remaining / totalBudget) * 100).toFixed(0) 
    : 0;
  
  overviewGrid.innerHTML = `
    <div class="yearly-stat-card total">
        <div class="yearly-stat-icon">💵</div>
        <div class="yearly-stat-content">
            <span class="yearly-stat-label">Total Yearly Spend</span>
            <span class="yearly-stat-value">${formatCurrency(totalSpent)}</span>
            <span class="yearly-stat-subtitle">Jan - Dec ${year}</span>
        </div>
    </div>
    <div class="yearly-stat-card remaining">
        <div class="yearly-stat-icon">💰</div>
        <div class="yearly-stat-content">
            <span class="yearly-stat-label">Remaining Budget</span>
            <span class="yearly-stat-value">${formatCurrency(remaining)}</span>
            <span class="yearly-stat-subtitle">${percentRemaining}% of annual budget</span>
        </div>
    </div>
    <div class="yearly-stat-card average">
        <div class="yearly-stat-icon">📊</div>
        <div class="yearly-stat-content">
            <span class="yearly-stat-label">Avg. Monthly Spend</span>
            <span class="yearly-stat-value">${formatCurrency(avgMonthly)}</span>
            <span class="yearly-stat-subtitle">Based on 12 months</span>
        </div>
    </div>
  `;
}

// Render the yearly category table
function renderYearlyCategoryTable(yearlyData, totalSpent) {
  const tbody = document.getElementById('yearlyTableBody');
  const tfoot = document.getElementById('yearlyTableFooter');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  yearlyData.categories.forEach(category => {
    const percentage = calculatePercentage(category.annualAmount, totalSpent);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="category-dot ${category.colorClass}"></span>${category.name}</td>
      <td class="amount">${formatCurrency(category.annualAmount)}</td>
      <td>${formatCurrency(category.monthlyAvg)}</td>
      <td>${percentage}%</td>
      <td><span class="trend-badge ${category.trend.type}">${category.trend.label}</span></td>
    `;
    
    tbody.appendChild(row);
  });
  
  if (tfoot) {
    const avgMonthly = totalSpent / 12;
    tfoot.innerHTML = `
      <tr class="total-row">
        <td><strong>Total</strong></td>
        <td class="amount"><strong>${formatCurrency(totalSpent)}</strong></td>
        <td><strong>${formatCurrency(avgMonthly)}</strong></td>
        <td><strong>100%</strong></td>
        <td></td>
      </tr>
    `;
  }
}

// Render the monthly spending breakdown
function renderMonthlyBreakdown(monthlyData) {
  const monthsGrid = document.getElementById('monthsGrid');
  if (!monthsGrid) return;
  
  monthsGrid.innerHTML = '';
  
  const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
  
  monthlyData.forEach(monthData => {
    const barWidth = ((monthData.amount / maxAmount) * 100).toFixed(0);
    
    const upcomingClass = monthData.isProjected ? 'upcoming' : '';
    const barFillClass = monthData.isProjected ? 'projected' : '';
    const amountPrefix = monthData.isProjected ? 'Est. ' : '';
    
    const monthCard = document.createElement('div');
    monthCard.className = `month-card ${upcomingClass}`;
    monthCard.innerHTML = `
      <div class="month-name">${monthData.month}</div>
      <div class="month-amount">${amountPrefix}${formatCurrency(monthData.amount)}</div>
      <div class="month-bar">
          <div class="month-bar-fill ${barFillClass}" style="width: ${barWidth}%"></div>
      </div>
    `;
    
    monthsGrid.appendChild(monthCard);
  });
}

// Render yearly insights and tips section
function renderInsights(insights) {
  const insightsGrid = document.getElementById('insightsGrid');
  if (!insightsGrid) return;
  
  insightsGrid.innerHTML = '';
  
  insights.forEach(insight => {
    const insightItem = document.createElement('div');
    insightItem.className = `insight-item ${insight.type}`;
    insightItem.innerHTML = `
      <div class="insight-icon">${insight.icon}</div>
      <div class="insight-content">
          <strong>${insight.title}</strong>
          <p>${insight.message}</p>
      </div>
    `;
    
    insightsGrid.appendChild(insightItem);
  });
}

// ============================================
// HELPER FUNCTIONS (theses are used by all pages)
// ============================================

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.budget-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `budget-notification ${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 120px;
    right: 40px;
    background: white;
    padding: 20px 32px;
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    font-weight: 600;
    font-size: 1.1rem;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    border-left: 6px solid;
    max-width: 400px;
  `;
  
  const colors = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };
  notification.style.borderLeftColor = colors[type] || colors.info;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
}

// ============================================
// CSS ANIMATIONS
// ============================================
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('Budgeting.js loaded successfully!');
console.log('Connected to backend at:', API_BASE_URL);
console.log('Current page:', window.location.pathname);