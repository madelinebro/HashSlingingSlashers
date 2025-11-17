document.addEventListener("DOMContentLoaded", () => {
  
  // ========== TAB SWITCHING (Works on all pages) ==========
  const budgetTabs = document.querySelectorAll(".budget-tab-btn");
  
  budgetTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      const period = btn.dataset.period;
      const pages = {
        week:  "budgeting_week.html",
        month: "budgeting_month.html",
        year:  "budgeting_year.html"
      };
      
      // Navigate to selected page
      if (pages[period]) {
        window.location.href = pages[period];
      }
    });
  });

  // ========== USER MENU TOGGLE (Works on all pages) ==========
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

  // === LOGOUT FUNCTIONALITY ===
  const logoutLink = document.querySelector(".sidebar-user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      window.location.href = "login.html";
    });
  }
  
  // ========== CHATBOT BUTTON (Works on all pages) ==========
  const chatbotBtn = document.querySelector('.chatbot');
  if (chatbotBtn) {
    chatbotBtn.addEventListener('click', () => {
      alert('Chatbot feature coming soon! 🤖');
    });
  }

  // ========== MONTHLY BUDGET SPECIFIC ==========
  if (window.location.pathname.includes('budgeting_month')) {
    initMonthlyBudget();
  }

  // ========== WEEKLY BUDGET SPECIFIC ==========
  if (window.location.pathname.includes('budgeting_week')) {
    initWeeklyBudget();
  }

  // ========== YEARLY BUDGET SPECIFIC ==========
  if (window.location.pathname.includes('budgeting_year')) {
    initYearlyBudget();
  }
});

// ============================================
// MONTHLY BUDGET FUNCTIONS
// ============================================
function initMonthlyBudget() {
  console.log('Initializing Monthly Budget Page...');
  
  // Load and render the monthly budget
  const budgetData = loadMonthlyBudgetData();
  renderMonthlyBudget(budgetData);
  
  // Handle budget form submission
  const budgetForm = document.getElementById('budgetForm');
  
  if (budgetForm) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveMonthlyBudget();
    });

    // Real-time budget calculation
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
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset to default values?')) {
        localStorage.removeItem('monthlyBudget');
        const defaultData = getDefaultMonthlyBudget();
        renderMonthlyBudget(defaultData);
        showNotification('ℹ️ Budget reset to defaults', 'info');
      }
    });
  }
}

/**
 * Get default monthly budget structure
 * This simulates what would come from the database
 */
function getDefaultMonthlyBudget() {
  return {
    totalBudget: 3705,
    categories: [
      { 
        id: 'bills', 
        name: 'Bills & Utilities', 
        budgeted: 2200, 
        spent: 2135, 
        icon: '💡',
        colorClass: 'bills'
      },
      { 
        id: 'shopping', 
        name: 'Shopping', 
        budgeted: 150, 
        spent: 58, 
        icon: '🛍️',
        colorClass: 'shopping'
      },
      { 
        id: 'car', 
        name: 'Car & Transportation', 
        budgeted: 150, 
        spent: 71, 
        icon: '🚗',
        colorClass: 'transport'
      },
      { 
        id: 'groceries', 
        name: 'Groceries', 
        budgeted: 300, 
        spent: 126, 
        icon: '🛒',
        colorClass: 'groceries'
      },
      { 
        id: 'food', 
        name: 'Food & Drinks', 
        budgeted: 250, 
        spent: 133, 
        icon: '🍔',
        colorClass: 'food'
      },
      { 
        id: 'entertainment', 
        name: 'Entertainment', 
        budgeted: 100, 
        spent: 42, 
        icon: '🎬',
        colorClass: 'entertainment'
      }
    ],
    month: 'October',
    year: 2025
  };
}

/**
 * Load monthly budget data
 * First checks localStorage, then falls back to defaults
 * In the future, this would fetch from your database
 */
function loadMonthlyBudgetData() {
  const savedBudget = localStorage.getItem('monthlyBudget');
  
  if (savedBudget) {
    try {
      return JSON.parse(savedBudget);
    } catch (e) {
      console.error('Error loading saved budget:', e);
      return getDefaultMonthlyBudget();
    }
  }
  
  return getDefaultMonthlyBudget();
}

/**
 * Render the monthly budget to the page
 */
function renderMonthlyBudget(budgetData) {
  // Update month display
  const currentMonthEl = document.getElementById('currentMonth');
  if (currentMonthEl) {
    currentMonthEl.textContent = budgetData.month || 'October';
  }
  
  // Calculate totals
  const totalSpent = budgetData.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudgeted = budgetData.categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const remaining = budgetData.totalBudget - totalSpent;
  
  // Update summary stats
  const totalSpentEl = document.getElementById('totalSpent');
  const remainingBudgetEl = document.getElementById('remainingBudget');
  
  if (totalSpentEl) {
    totalSpentEl.textContent = formatCurrency(totalSpent);
  }
  if (remainingBudgetEl) {
    remainingBudgetEl.textContent = formatCurrency(remaining);
  }
  
  // Render category table
  renderCategoryTable(budgetData);
  
  // Render budget form
  renderBudgetForm(budgetData);
}

/**
 * Render the category breakdown table
 */
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

/**
 * Render the budget form inputs
 */
function renderBudgetForm(budgetData) {
  const formGrid = document.getElementById('budgetFormGrid');
  if (!formGrid) return;
  
  formGrid.innerHTML = '';
  
  // Total Monthly Budget input
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
  
  // Category inputs
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
  
  // Add event listeners to new inputs
  const inputs = formGrid.querySelectorAll('input[type="number"]');
  inputs.forEach(input => {
    input.addEventListener('input', calculateAndUpdateMonthlyTotals);
  });
  
  // Initial calculation
  calculateAndUpdateMonthlyTotals();
}

/**
 * Calculate and update monthly totals with visual feedback
 */
function calculateAndUpdateMonthlyTotals() {
  const monthlySpendInput = document.getElementById('monthlySpend');
  const totalBudget = parseFloat(monthlySpendInput?.value) || 0;
  
  // Get current budget data to access spent amounts
  const budgetData = loadMonthlyBudgetData();
  
  // Calculate total allocated
  let totalAllocated = 0;
  budgetData.categories.forEach(category => {
    const input = document.getElementById(category.id);
    if (input) {
      totalAllocated += parseFloat(input.value) || 0;
    }
  });
  
  const remaining = totalBudget - totalAllocated;
  
  // Visual feedback on total budget input
  if (monthlySpendInput) {
    if (totalAllocated > totalBudget) {
      monthlySpendInput.style.borderColor = '#ef4444';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
    } else if (remaining < totalBudget * 0.1) {
      monthlySpendInput.style.borderColor = '#f59e0b';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
    } else {
      monthlySpendInput.style.borderColor = '#10b981';
      monthlySpendInput.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
    }
  }
}

/**
 * Save monthly budget to localStorage
 * In the future, this would save to your database
 */
function saveMonthlyBudget() {
  const budgetData = loadMonthlyBudgetData();
  
  // Update total budget
  const monthlySpendInput = document.getElementById('monthlySpend');
  budgetData.totalBudget = parseFloat(monthlySpendInput?.value) || 0;
  
  // Update category budgets
  let totalAllocated = 0;
  budgetData.categories.forEach(category => {
    const input = document.getElementById(category.id);
    if (input) {
      category.budgeted = parseFloat(input.value) || 0;
      totalAllocated += category.budgeted;
    }
  });
  
  // Validate
  if (totalAllocated > budgetData.totalBudget) {
    showNotification(
      `⚠️ Warning: Total allocated (${formatCurrency(totalAllocated)}) exceeds monthly budget (${formatCurrency(budgetData.totalBudget)})!`, 
      'warning'
    );
    return;
  }
  
  // Save to localStorage
  budgetData.lastUpdated = new Date().toISOString();
  localStorage.setItem('monthlyBudget', JSON.stringify(budgetData));
  
  // Re-render to show updates
  renderMonthlyBudget(budgetData);
  
  showNotification('✅ Budget updated successfully!', 'success');
}

/**
 * Determine spending status based on spent vs budgeted
 */
function getSpendingStatus(spent, budgeted) {
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
function initWeeklyBudget() {
  console.log('Initializing Weekly Budget Page...');
  
  // Load and render the weekly budget
  const weeklyData = loadWeeklyBudgetData();
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
 * Get default weekly budget structure
 * This simulates what would come from the database
 */
function getDefaultWeeklyBudget() {
  return {
    weekStart: '2025-11-04',
    weekEnd: '2025-11-10',
    weekLabel: 'Current Week',
    weeklyBudget: 850,
    totalSpent: 592,
    lastWeekSpent: 640,
    dailyData: [
      {
        day: 'Monday',
        date: 'Nov 4',
        dateISO: '2025-11-04',
        amount: 127.50,
        transactions: 8,
        topCategory: { name: 'Groceries', amount: 52, colorClass: 'groceries' },
        isToday: false
      },
      {
        day: 'Tuesday',
        date: 'Nov 5',
        dateISO: '2025-11-05',
        amount: 43.20,
        transactions: 3,
        topCategory: { name: 'Food & Drinks', amount: 28, colorClass: 'food' },
        isToday: false
      },
      {
        day: 'Wednesday',
        date: 'Nov 6',
        dateISO: '2025-11-06',
        amount: 89.75,
        transactions: 5,
        topCategory: { name: 'Transportation', amount: 45, colorClass: 'transport' },
        isToday: false
      },
      {
        day: 'Thursday',
        date: 'Nov 7',
        dateISO: '2025-11-07',
        amount: 156.30,
        transactions: 6,
        topCategory: { name: 'Shopping', amount: 98, colorClass: 'shopping' },
        isToday: false
      },
      {
        day: 'Friday',
        date: 'Nov 8',
        dateISO: '2025-11-08',
        amount: 78.40,
        transactions: 7,
        topCategory: { name: 'Food & Drinks', amount: 45, colorClass: 'food' },
        isToday: false
      },
      {
        day: 'Saturday',
        date: 'Nov 9',
        dateISO: '2025-11-09',
        amount: 64.85,
        transactions: 4,
        topCategory: { name: 'Entertainment', amount: 38, colorClass: 'entertainment' },
        isToday: false
      },
      {
        day: 'Sunday',
        date: 'Nov 10',
        dateISO: '2025-11-10',
        amount: 32.00,
        transactions: 2,
        topCategory: { name: 'Food & Drinks', amount: 32, colorClass: 'food' },
        isToday: true
      }
    ],
    categoryData: [
      {
        id: 'groceries',
        name: 'Groceries',
        spent: 126,
        budget: 150,
        colorClass: 'groceries'
      },
      {
        id: 'food',
        name: 'Food & Drinks',
        spent: 133,
        budget: 145,
        colorClass: 'food'
      },
      {
        id: 'shopping',
        name: 'Shopping',
        spent: 98,
        budget: 150,
        colorClass: 'shopping'
      },
      {
        id: 'transport',
        name: 'Transportation',
        spent: 71,
        budget: 95,
        colorClass: 'transport'
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        spent: 42,
        budget: 75,
        colorClass: 'entertainment'
      },
      {
        id: 'bills',
        name: 'Bills & Utilities',
        spent: 122,
        budget: 170,
        colorClass: 'bills'
      }
    ],
    insights: [
      {
        type: 'success',
        icon: '✓',
        title: 'Great Job!',
        message: "You're on track to stay under budget this week"
      },
      {
        type: 'info',
        icon: '📌',
        title: 'Reminder',
        message: 'Weekly budget resets in 1 day'
      },
      {
        type: 'suggestion',
        icon: '💡',
        title: 'Smart Tip',
        message: 'Thursday was your highest spending day. Plan meals ahead to save more'
      }
    ]
  };
}

/**
 * Load weekly budget data
 */
function loadWeeklyBudgetData(weekOffset = 0) {
  const savedWeeklyData = localStorage.getItem(`weeklyBudget_${weekOffset}`);
  
  if (savedWeeklyData) {
    try {
      return JSON.parse(savedWeeklyData);
    } catch (e) {
      console.error('Error loading saved weekly budget:', e);
      return getDefaultWeeklyBudget();
    }
  }
  
  return getDefaultWeeklyBudget();
}

/**
 * Navigate to a different week
 */
function navigateWeek(offset) {
  let currentOffset = parseInt(localStorage.getItem('currentWeekOffset') || '0');
  currentOffset += offset;
  localStorage.setItem('currentWeekOffset', currentOffset.toString());
  
  const weeklyData = loadWeeklyBudgetData(currentOffset);
  
  if (currentOffset === 0) {
    weeklyData.weekLabel = 'Current Week';
  } else if (currentOffset === -1) {
    weeklyData.weekLabel = 'Last Week';
  } else if (currentOffset === 1) {
    weeklyData.weekLabel = 'Next Week';
  } else if (currentOffset < 0) {
    weeklyData.weekLabel = `${Math.abs(currentOffset)} Weeks Ago`;
  } else {
    weeklyData.weekLabel = `${currentOffset} Weeks Ahead`;
  }
  
  renderWeeklyBudget(weeklyData);
}

/**
 * Render the weekly budget to the page
 */
function renderWeeklyBudget(weeklyData) {
  const weekLabelEl = document.getElementById('weekLabel');
  const weekDatesEl = document.getElementById('weekDates');
  
  if (weekLabelEl) {
    weekLabelEl.textContent = weeklyData.weekLabel;
  }
  if (weekDatesEl) {
    weekDatesEl.textContent = formatWeekDateRange(weeklyData.weekStart, weeklyData.weekEnd);
  }
  
  const dailyAverage = weeklyData.totalSpent / 7;
  const remaining = weeklyData.weeklyBudget - weeklyData.totalSpent;
  const percentRemaining = ((remaining / weeklyData.weeklyBudget) * 100).toFixed(0);
  const spendingDiff = weeklyData.totalSpent - weeklyData.lastWeekSpent;
  
  renderWeeklyOverviewCards(weeklyData.totalSpent, dailyAverage, remaining, percentRemaining, spendingDiff);
  renderDailyBreakdown(weeklyData.dailyData);
  renderWeeklyCategoryBreakdown(weeklyData.categoryData);
  renderWeeklyInsights(weeklyData.insights);
}

/**
 * Render weekly overview cards
 */
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

/**
 * Render daily breakdown
 */
function renderDailyBreakdown(dailyData) {
  const daysGrid = document.getElementById('daysGrid');
  if (!daysGrid) return;
  
  daysGrid.innerHTML = '';
  const maxAmount = Math.max(...dailyData.map(d => d.amount));
  
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

/**
 * Render weekly category breakdown
 */
function renderWeeklyCategoryBreakdown(categoryData) {
  const categoryGrid = document.getElementById('categoryBreakdownGrid');
  if (!categoryGrid) return;
  
  categoryGrid.innerHTML = '';
  
  categoryData.forEach(category => {
    const percentUsed = ((category.spent / category.budget) * 100).toFixed(0);
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

/**
 * Render weekly insights
 */
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

/**
 * Format week date range
 */
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
function initYearlyBudget() {
  console.log('Initializing Yearly Budget Page...');
  
  const yearlyData = loadYearlyBudgetData();
  renderYearlyBudget(yearlyData);
  
  const prevYearBtn = document.getElementById('prevYearBtn');
  const nextYearBtn = document.getElementById('nextYearBtn');
  
  if (prevYearBtn) {
    prevYearBtn.addEventListener('click', () => {
      const currentYear = parseInt(document.getElementById('currentYear')?.textContent) || 2025;
      const newYear = currentYear - 1;
      loadAndRenderYear(newYear);
      showNotification(`⬅️ Loading ${newYear} data...`, 'info');
    });
  }
  
  if (nextYearBtn) {
    nextYearBtn.addEventListener('click', () => {
      const currentYear = parseInt(document.getElementById('currentYear')?.textContent) || 2025;
      const newYear = currentYear + 1;
      loadAndRenderYear(newYear);
      showNotification(`➡️ Loading ${newYear} data...`, 'info');
    });
  }

  console.log('Yearly budget initialized successfully!');
}

/**
 * Get default yearly budget structure
 */
function getDefaultYearlyBudget() {
  return {
    year: 2025,
    totalYearlyBudget: 44436,
    categories: [
      {
        id: 'bills',
        name: 'Bills & Utilities',
        annualAmount: 25620,
        monthlyAvg: 2135,
        colorClass: 'bills',
        trend: { type: 'stable', value: 0, label: 'Stable' }
      },
      {
        id: 'shopping',
        name: 'Shopping',
        annualAmount: 696,
        monthlyAvg: 58,
        colorClass: 'shopping',
        trend: { type: 'decreasing', value: -12, label: '↓ 12%' }
      },
      {
        id: 'car',
        name: 'Car & Transportation',
        annualAmount: 852,
        monthlyAvg: 71,
        colorClass: 'transport',
        trend: { type: 'stable', value: 0, label: 'Stable' }
      },
      {
        id: 'groceries',
        name: 'Groceries',
        annualAmount: 1512,
        monthlyAvg: 126,
        colorClass: 'groceries',
        trend: { type: 'increasing', value: 8, label: '↑ 8%' }
      },
      {
        id: 'food',
        name: 'Food & Drinks',
        annualAmount: 1596,
        monthlyAvg: 133,
        colorClass: 'food',
        trend: { type: 'increasing', value: 15, label: '↑ 15%' }
      },
      {
        id: 'entertainment',
        name: 'Entertainment',
        annualAmount: 504,
        monthlyAvg: 42,
        colorClass: 'entertainment',
        trend: { type: 'decreasing', value: -5, label: '↓ 5%' }
      }
    ],
    monthlyData: [
      { month: 'January', amount: 2890, isProjected: false },
      { month: 'February', amount: 2650, isProjected: false },
      { month: 'March', amount: 2450, isProjected: false },
      { month: 'April', amount: 2580, isProjected: false },
      { month: 'May', amount: 2720, isProjected: false },
      { month: 'June', amount: 2340, isProjected: false },
      { month: 'July', amount: 2810, isProjected: false },
      { month: 'August', amount: 2490, isProjected: false },
      { month: 'September', amount: 2380, isProjected: false },
      { month: 'October', amount: 2567, isProjected: false },
      { month: 'November', amount: 2600, isProjected: true },
      { month: 'December', amount: 2703, isProjected: true }
    ],
    insights: [
      {
        type: 'positive',
        icon: '✓',
        title: 'On Track',
        message: "You're 31% under your annual budget with 2 months remaining"
      },
      {
        type: 'warning',
        icon: '⚠',
        title: 'Watch Out',
        message: 'Food & Drinks spending increased 15% this year'
      },
      {
        type: 'info',
        icon: '💡',
        title: 'Tip',
        message: 'Consider setting aside $1,000/month for savings based on your surplus'
      }
    ]
  };
}

/**
 * Load yearly budget data
 */
function loadYearlyBudgetData(year = 2025) {
  const savedYearlyData = localStorage.getItem(`yearlyBudget_${year}`);
  
  if (savedYearlyData) {
    try {
      return JSON.parse(savedYearlyData);
    } catch (e) {
      console.error('Error loading saved yearly budget:', e);
      return getDefaultYearlyBudget();
    }
  }
  
  return getDefaultYearlyBudget();
}

/**
 * Load and render a specific year
 */
function loadAndRenderYear(year) {
  const yearlyData = loadYearlyBudgetData(year);
  yearlyData.year = year;
  renderYearlyBudget(yearlyData);
}

/**
 * Render the yearly budget to the page
 */
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

/**
 * Render the yearly overview cards
 */
function renderYearlyOverviewCards(totalSpent, remaining, avgMonthly, year) {
  const overviewGrid = document.getElementById('yearlyOverviewGrid');
  if (!overviewGrid) return;
  
  const percentRemaining = ((remaining / (totalSpent + remaining)) * 100).toFixed(0);
  
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

/**
 * Render the yearly category table
 */
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

/**
 * Render the monthly breakdown chart
 */
function renderMonthlyBreakdown(monthlyData) {
  const monthsGrid = document.getElementById('monthsGrid');
  if (!monthsGrid) return;
  
  monthsGrid.innerHTML = '';
  const maxAmount = Math.max(...monthlyData.map(m => m.amount));
  
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

/**
 * Render insights section
 */
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
// HELPER FUNCTIONS (Used by all pages)
// ============================================

/**
 * Show notification toast
 */
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

/**
 * Format currency
 */
function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
}

// Add CSS animations
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
console.log('Current page:', window.location.pathname);