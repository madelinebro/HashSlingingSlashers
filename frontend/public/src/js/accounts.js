/* ======================================================================
  BloomFi - My Accounts (accounts.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Sample data for now -- replace with real API calls in the future
  // Each account has: basic info, balances, and transaction history
  const SAMPLE_ACCOUNTS = [
    {
      id: "chk-001",
      name: "Checking",
      number: "**** 1234",
      color: "teal",  // Used for card styling
      icon: "💵",
      balance: 3120.58, // Current balance
      available: 3050.22,
      pending: -45.12,
      transactions: [
        // Last 30 days (November 2025)
        { id: "t1", desc: "Deposit - Payroll", date: "2025-11-15", amount: 1850, type: "income" },
        { id: "t2", desc: "Rent", date: "2025-11-01", amount: -1200, type: "expense" },
        { id: "t3", desc: "Coffee Shop", date: "2025-11-18", amount: -5.75, type: "expense" },
        { id: "t4", desc: "Transfer to Savings", date: "2025-11-10", amount: -150, type: "transfer" },
        { id: "t5", desc: "Online Shopping", date: "2025-11-12", amount: -89.99, type: "expense" },
        { id: "t6", desc: "Restaurant", date: "2025-11-16", amount: -45.30, type: "expense" },
        
        // 30-90 days ago (September-October 2025)
        { id: "t7", desc: "Deposit - Payroll", date: "2025-10-15", amount: 1850, type: "income" },
        { id: "t8", desc: "Electric Bill", date: "2025-10-05", amount: -120.50, type: "expense" },
        { id: "t9", desc: "Gym Membership", date: "2025-10-01", amount: -50, type: "expense" },
        { id: "t10", desc: "Grocery Store", date: "2025-09-28", amount: -156.78, type: "expense" },
        { id: "t11", desc: "Gas Station", date: "2025-09-25", amount: -45.00, type: "expense" },
        { id: "t12", desc: "Deposit - Payroll", date: "2025-09-15", amount: 1850, type: "income" },
        
        // Year to date - older transactions (Jan-Aug 2025)
        { id: "t13", desc: "Tax Refund", date: "2025-04-15", amount: 850, type: "income" },
        { id: "t14", desc: "Car Insurance", date: "2025-03-01", amount: -450, type: "expense" },
        { id: "t15", desc: "Vacation Expense", date: "2025-07-10", amount: -1200, type: "expense" },
        { id: "t16", desc: "Bonus Payment", date: "2025-06-30", amount: 500, type: "income" },
        { id: "t17", desc: "Medical Bill", date: "2025-02-14", amount: -275, type: "expense" },
        { id: "t18", desc: "Deposit - Payroll", date: "2025-01-15", amount: 1850, type: "income" },
      ],
    },
    {
      id: "sav-001",
      name: "Savings",
      number: "**** 9876",
      color: "blue",
      icon: "🏦",
      balance: 4770.12,
      available: 4770.12,
      pending: 0,
      transactions: [
        // Last 30 days
        { id: "t19", desc: "Interest Payment", date: "2025-11-01", amount: 6.84, type: "income" },
        { id: "t20", desc: "Transfer from Checking", date: "2025-11-10", amount: 150, type: "income" },
        
        // 30-90 days ago
        { id: "t21", desc: "Interest Payment", date: "2025-10-01", amount: 6.50, type: "income" },
        { id: "t22", desc: "Transfer from Checking", date: "2025-09-15", amount: 200, type: "income" },
        { id: "t23", desc: "Interest Payment", date: "2025-09-01", amount: 6.25, type: "income" },
        
        // Year to date
        { id: "t24", desc: "Initial Deposit", date: "2025-01-05", amount: 2000, type: "income" },
        { id: "t25", desc: "Interest Payment", date: "2025-05-01", amount: 5.80, type: "income" },
        { id: "t26", desc: "Emergency Withdrawal", date: "2025-08-12", amount: -500, type: "expense" },
      ],
    },
    {
      id: "crd-001",
      name: "BloomFi Rewards Card",
      number: "**** 5521",
      color: "green",
      icon: "💳",
      balance: -0.25, 
      available: 2450.75, 
      pending: -35.9,
      transactions: [
        // Last 30 days
        { id: "t27", desc: "Groceries", date: "2025-11-17", amount: -86.12, type: "expense" },
        { id: "t28", desc: "Gas", date: "2025-11-14", amount: -35.90, type: "expense" },
        { id: "t29", desc: "Rewards Credit", date: "2025-11-05", amount: 5, type: "income" },
        { id: "t30", desc: "Amazon Purchase", date: "2025-11-08", amount: -124.99, type: "expense" },
        { id: "t31", desc: "Restaurant", date: "2025-11-11", amount: -67.45, type: "expense" },
        
        // 30-90 days ago
        { id: "t32", desc: "Groceries", date: "2025-10-20", amount: -95.30, type: "expense" },
        { id: "t33", desc: "Monthly Payment", date: "2025-10-15", amount: 450, type: "income" },
        { id: "t34", desc: "Electronics Store", date: "2025-09-28", amount: -299.99, type: "expense" },
        { id: "t35", desc: "Gas", date: "2025-09-22", amount: -42.15, type: "expense" },
        
        // Year to date
        { id: "t36", desc: "Hotel Booking", date: "2025-07-05", amount: -456.00, type: "expense" },
        { id: "t37", desc: "Airline Tickets", date: "2025-06-20", amount: -680, type: "expense" },
        { id: "t38", desc: "Monthly Payment", date: "2025-05-15", amount: 325, type: "income" },
        { id: "t39", desc: "Department Store", date: "2025-03-10", amount: -189.50, type: "expense" },
      ],
    },
  ];

  // DOM elements
  const elGrid = document.getElementById("accountsGrid");
  const elTotalBalance = document.getElementById("totalBalanceOverview");
  const elTotalAccounts = document.getElementById("totalAccounts");
  const elModal = document.getElementById("transactionModal");
  const elModalName = document.getElementById("modalAccountName");
  const elModalNumber = document.getElementById("modalAccountNumber");
  const elModalBalance = document.getElementById("modalBalance");
  const elModalDateRange = document.getElementById("modalDateRange");
  const elModalTbody = document.getElementById("modalTxBody");
  const userToggleBtn = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");

 // Utility functions
 // Format numbers as currency (USD)
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  // Return CSS class based on positive/negative amount
  const classForAmount = (amount) => (amount >= 0 ? "amount positive" : "amount negative");
 // Generate HTML badge based on transaction type
  const badgeForType = (type) => {
    switch (type) {
      case "income":
        return `<span class="transaction-badge badge-income">Income</span>`;
      case "expense":
        return `<span class="transaction-badge badge-expense">Expense</span>`;
      default:
        return `<span class="transaction-badge badge-transfer">Transfer</span>`;
    }
  };

  // Main function to render all accounts and update totals
  function renderAccounts(accounts) {
    // Calculate total balance across all accounts
    const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    // Update summary display at top of page
    if (elTotalBalance) elTotalBalance.textContent = fmtCurrency(total);
    if (elTotalAccounts) elTotalAccounts.textContent = accounts.length.toString();

    // Build "All Accounts" card and the individual account cards
    const allAccountsCard = buildAllAccountsCard(accounts, total);
    const individualCards = accounts.map(buildAccountCard).join("");
    elGrid.innerHTML = allAccountsCard + individualCards || `<p>No accounts found.</p>`;
  }
// Build the "All Accounts" summary card-- contains all accounts
  function buildAllAccountsCard(accounts, total) {
    return `
      <article class="account-card purple" data-account-id="all-accounts" tabindex="0" aria-label="All Accounts combined view">
        <header class="account-card-header">
          <div class="account-card-icon" aria-hidden="true">📊</div>
          <div class="account-card-info">
            <h3 class="account-card-name">All Accounts</h3>
            <p class="account-card-number">${accounts.length} account${accounts.length !== 1 ? 's' : ''}</p>
          </div>
        </header>

        <div class="account-card-balance">
          <span class="balance-label">Combined Balance</span>
          <span class="balance-amount">${fmtCurrency(total)}</span>
        </div>

        <div class="account-card-stats">
          <div class="account-stat">
            <span class="stat-label">Accounts</span>
            <span class="stat-value">${accounts.length}</span>
          </div>
          <div class="account-stat">
            <span class="stat-label">Total</span>
            <span class="stat-value">${fmtCurrency(total)}</span>
          </div>
        </div>

        <button class="account-card-btn" data-action="open-transactions" data-account-id="all-accounts">
          View Transactions
        </button>
      </article>
    `;
  }

  // Build HTML for a single account card
  function buildAccountCard(a) {
    // Ensure safe text-- converts values to strings
    const safe = (s) => String(s ?? "");
    return `
      <article class="account-card ${safe(a.color)}" data-account-id="${safe(a.id)}" tabindex="0" aria-label="${safe(
        a.name
      )} account">
        <header class="account-card-header">
          <div class="account-card-icon" aria-hidden="true">${safe(a.icon || "💼")}</div>
          <div class="account-card-info">
            <h3 class="account-card-name">${safe(a.name)}</h3>
            <p class="account-card-number">${safe(a.number)}</p>
          </div>
        </header>

        <div class="account-card-balance">
          <span class="balance-label">Current Balance</span>
          <span class="balance-amount">${fmtCurrency(Number(a.balance) || 0)}</span>
        </div>

        <div class="account-card-stats">
          <div class="account-stat">
            <span class="stat-label">Available</span>
            <span class="stat-value">${fmtCurrency(Number(a.available) || 0)}</span>
          </div>
          <div class="account-stat">
            <span class="stat-label">Pending</span>
            <span class="stat-value">${fmtCurrency(Number(a.pending) || 0)}</span>
          </div>
        </div>

        <button class="account-card-btn" data-action="open-transactions" data-account-id="${safe(a.id)}">
          View Transactions
        </button>
      </article>
    `;
  }

  // Transaction Modal Functions
  // Track which accounts transactions are displayed
  let currentAccount = null;
  let currentAccountsList = null; // For "All Accounts" view
  // For restoring focus when modal closes
  let lastFocusedElementBeforeModal = null;

  // Helper function to filter transactions by date range
  function filterTransactionsByDateRange(transactions, dateRange) {
    const today = new Date("2025-11-21"); // Using current date from context
    let cutoffDate;

    switch (dateRange) {
      case "Last 30 days":
        cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case "Last 90 days":
        cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
      case "Year to date":
        cutoffDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case "All time":
        return transactions; // Return all transactions
      default:
        cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - 30);
    }

    // Filter transactions that are on or after the cutoff date
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= cutoffDate;
    });
  }

  // Open modal and populate with account transactions
  function openTransactionModal(account, allAccounts = null) {
    currentAccount = account;
    currentAccountsList = allAccounts;

    // Get current date range selection
    const currentDateRange = elModalDateRange.textContent?.trim() || "Last 30 days";

    // Handle "All Accounts" view 
    if (account.id === "all-accounts" && allAccounts) {
      elModalName.textContent = "All Accounts — Transactions";
      elModalNumber.textContent = `${allAccounts.length} account${allAccounts.length !== 1 ? 's' : ''}`;

      // Calculate total balance
      const totalBalance = allAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      elModalBalance.textContent = fmtCurrency(totalBalance);
      elModalDateRange.textContent = currentDateRange;

      // Combine all transactions from all accounts
      const allTransactions = allAccounts.flatMap(a => a.transactions || []);
      
      // Filter by date range
      const filteredTransactions = filterTransactionsByDateRange(allTransactions, currentDateRange)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      // Build transaction rows
      elModalTbody.innerHTML =
        filteredTransactions
          .map((t) => {
            const amt = Number(t.amount) || 0;
            return `
            <tr>
              <td>${escapeHTML(t.desc)}</td>
              <td>${escapeHTML(formatDate(t.date))}</td>
              <td class="${classForAmount(amt)}">${fmtCurrency(amt)}</td>
              <td>${badgeForType(t.type)}</td>
            </tr>`;
          })
          .join("") || `<tr><td colspan="4">No transactions in this range.</td></tr>`;
    
        } 
    // Handle single account view
    else {
      elModalName.textContent = account.name + " — Transactions";
      elModalNumber.textContent = account.number;
      elModalBalance.textContent = fmtCurrency(Number(account.balance) || 0);
      elModalDateRange.textContent = currentDateRange;
      
      // Filter transactions by date range
      const filteredTransactions = filterTransactionsByDateRange(account.transactions, currentDateRange)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      // Build transaction rows
      elModalTbody.innerHTML =
        filteredTransactions
          .map((t) => {
            const amt = Number(t.amount) || 0;
            return `
            <tr>
              <td>${escapeHTML(t.desc)}</td>
              <td>${escapeHTML(formatDate(t.date))}</td>
              <td class="${classForAmount(amt)}">${fmtCurrency(amt)}</td>
              <td>${badgeForType(t.type)}</td>
            </tr>`;
          })
          .join("") || `<tr><td colspan="4">No transactions in this range.</td></tr>`;
    }

    // Show modal and prevent page scrolling
    lastFocusedElementBeforeModal = document.activeElement;
    elModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Move focus to close button
    const closeBtn = elModal.querySelector(".modal-close");
    closeBtn?.focus();

    // Set up keyboard handlers (event listeners) for modal
    document.addEventListener("keydown", handleModalKeys);
    elModal.addEventListener("click", handleBackdropClick);
  }

  // Close modal and restore previous state
  function closeTransactionModal() {
    elModal.style.display = "none";
    document.body.style.overflow = "";
    // Remove event listeners
    document.removeEventListener("keydown", handleModalKeys);
    elModal.removeEventListener("click", handleBackdropClick);
    currentAccount = null;
    currentAccountsList = null;

    // Restore focus to element that opened the modal
    if (lastFocusedElementBeforeModal) {
      lastFocusedElementBeforeModal.focus?.();
      lastFocusedElementBeforeModal = null;
    }
  }

  // Handle keyboard navigation in modal 
  function handleModalKeys(e) {
    // Close modal on ESC key
    if (e.key === "Escape") {
      e.preventDefault();
      closeTransactionModal();
    }
    // Trap focus inside modal with Tab key
    if (e.key === "Tab") {
      const focusables = elModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      // Shift+Tab on first element then go to last element
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } 
      // Tab on last element then go to first element
      else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Close modal when clicking outside the content area
  function handleBackdropClick(e) {
    if (e.target === elModal) {
      closeTransactionModal();
    }
  }

  // Expose for inline onclick in HTML
  window.closeTransactionModal = closeTransactionModal;

  // Date Range Picker Functionality
  window.openDatePickerModal = function openDatePickerModal() {
    if (!currentAccount) return;
    
    // Cycle through date range presets
    const presets = ["Last 30 days", "Last 90 days", "Year to date", "All time"];
    const current = elModalDateRange.textContent?.trim();
    const nextIndex = (presets.indexOf(current) + 1) % presets.length;
    const next = presets[nextIndex];
    
    // Update the date range display
    elModalDateRange.textContent = next;
    
    // Reopen the modal with the new date range to refresh the transaction list
    openTransactionModal(currentAccount, currentAccountsList);
  };

 
  // Sidebar user menu
  if (userToggleBtn && userMenu) {
    // Toggle menu visibility on button click
    userToggleBtn.addEventListener("click", () => {
      const expanded = userToggleBtn.getAttribute("aria-expanded") === "true";
      userToggleBtn.setAttribute("aria-expanded", String(!expanded));
      userMenu.style.display = expanded ? "none" : "block";
    });

    // close if clicking outside
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target) && !userToggleBtn.contains(e.target)) {
        userToggleBtn.setAttribute("aria-expanded", "false");
        userMenu.style.display = "none";
      }
    });
  }

  // Initialize, load and display data
  // Currently using sample data
  // Replace with API call like: fetch('/api/accounts')
  const accounts = SAMPLE_ACCOUNTS;
  // Create lookup map by ID
  const ACCOUNTS_BY_ID = new Map(accounts.map((a) => [a.id, a]));

  // Initial render of all accounts
  renderAccounts(accounts);

  // Handle View Transactions button clicks
  elGrid.addEventListener("click", (e) => {
    // Find if a "View Transactions" button was clicked
    const btn = e.target.closest('[data-action="open-transactions"]');
    if (!btn) return;

    const accountId = btn.getAttribute("data-account-id");
    // Open view for "All Accounts"
    if (accountId === "all-accounts") {
      openTransactionModal({ id: "all-accounts" }, accounts);
    }
    // Open single account view 
    else {
      const account = ACCOUNTS_BY_ID.get(accountId);
      if (account) {
        openTransactionModal(account);
      }
    }
  });

  // Helper functions
  // Format dates Nov 3, 2025 for example
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  // Escape HTML special characters
  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});