/* ======================================================================
  BloomFi - My Accounts (accounts.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
  Updated: Now connects to real backend API
   ====================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  // API Configuration
  const API_BASE_URL = "http://localhost:8000/api";
  
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
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
  
  const classForAmount = (amount) => (amount >= 0 ? "amount positive" : "amount negative");
  
  const badgeForType = (type) => {
    switch (type) {
      case "income":
      case "Deposit":
        return `<span class="transaction-badge badge-income">Income</span>`;
      case "expense":
      case "Withdrawal":
        return `<span class="transaction-badge badge-expense">Expense</span>`;
      default:
        return `<span class="transaction-badge badge-transfer">Transfer</span>`;
    }
  };

  // API functions to Connect to Backend
  async function fetchAccounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const accounts = await response.json();
      
      // Transform backend data to match frontend format
      return accounts.map(acc => ({
        id: acc.accountnumber.toString(),
        name: acc.account_type,
        number: acc.account_display_number || `**** ${acc.accountnumber}`,
        color: getColorForAccountType(acc.account_type),
        icon: getIconForAccountType(acc.account_type),
        balance: parseFloat(acc.balance),
        available: parseFloat(acc.balance), // Adjust if you have separate available balance
        pending: 0, // Adjust if you track pending transactions
        accountnumber: acc.accountnumber
      }));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showError("Failed to load accounts. Please try again.");
      return [];
    }
  }

  async function fetchTransactions(accountNumber = null) {
    try {
      let url = `${API_BASE_URL}/transactions`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      let transactions = await response.json();
      
      // Filter by account if specified
      if (accountNumber) {
        transactions = transactions.filter(tx => tx.accountnumber === accountNumber);
      }
      
      // Transform backend data to match frontend format
      return transactions.map(tx => ({
        id: tx.transaction_id.toString(),
        desc: tx.description || "Unknown Transaction",
        date: tx.transaction_date,
        amount: parseFloat(tx.amount),
        type: mapTransactionType(tx.transaction_type),
        category: tx.category || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showError("Failed to load transactions. Please try again.");
      return [];
    }
  }

  // Helper: Map account types to colors
  function getColorForAccountType(type) {
    const typeMap = {
      'Checking': 'teal',
      'Savings': 'blue',
      'Credit': 'green',
      'Credit Card': 'green'
    };
    return typeMap[type] || 'purple';
  }

  // Helper: Map account types to icons
  function getIconForAccountType(type) {
    const iconMap = {
      'Checking': '💵',
      'Savings': '🏦',
      'Credit': '💳',
      'Credit Card': '💳'
    };
    return iconMap[type] || '💼';
  }

  // Helper: Map transaction types
  function mapTransactionType(backendType) {
    const typeMap = {
      'Deposit': 'income',
      'Withdrawal': 'expense',
      'Transfer': 'transfer'
    };
    return typeMap[backendType] || 'expense';
  }

  // Helper: Show error message
  function showError(message) {
    // You can customize this to show errors in your UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background: #f44336; color: white; padding: 1rem; margin: 1rem; border-radius: 8px;';
    errorDiv.textContent = message;
    elGrid.insertAdjacentElement('beforebegin', errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  // Main function to render all accounts and update totals
  function renderAccounts(accounts) {
    const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    
    if (elTotalBalance) elTotalBalance.textContent = fmtCurrency(total);
    if (elTotalAccounts) elTotalAccounts.textContent = accounts.length.toString();

    const allAccountsCard = buildAllAccountsCard(accounts, total);
    const individualCards = accounts.map(buildAccountCard).join("");
    elGrid.innerHTML = allAccountsCard + individualCards || `<p>No accounts found.</p>`;
  }

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

  function buildAccountCard(a) {
    const safe = (s) => String(s ?? "");
    return `
      <article class="account-card ${safe(a.color)}" data-account-id="${safe(a.id)}" tabindex="0" aria-label="${safe(a.name)} account">
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
  let currentAccount = null;
  let currentAccountsList = null;
  let allTransactionsCache = []; // Cache all transactions
  let lastFocusedElementBeforeModal = null;

  function filterTransactionsByDateRange(transactions, dateRange) {
    const today = new Date();
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
        cutoffDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "All time":
        return transactions;
      default:
        cutoffDate = new Date(today);
        cutoffDate.setDate(cutoffDate.getDate() - 30);
    }

    return transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= cutoffDate;
    });
  }

  async function openTransactionModal(account, allAccounts = null) {
    currentAccount = account;
    currentAccountsList = allAccounts;

    const currentDateRange = elModalDateRange.textContent?.trim() || "Last 30 days";

    // Show loading state
    elModalTbody.innerHTML = '<tr><td colspan="4">Loading transactions...</td></tr>';
    elModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    try {
      let transactions;
      
      if (account.id === "all-accounts" && allAccounts) {
        // Fetch all transactions
        transactions = await fetchTransactions();
        
        elModalName.textContent = "All Accounts — Transactions";
        elModalNumber.textContent = `${allAccounts.length} account${allAccounts.length !== 1 ? 's' : ''}`;
        
        const totalBalance = allAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
        elModalBalance.textContent = fmtCurrency(totalBalance);
      } else {
        // Fetch transactions for specific account
        transactions = await fetchTransactions(account.accountnumber);
        
        elModalName.textContent = account.name + " — Transactions";
        elModalNumber.textContent = account.number;
        elModalBalance.textContent = fmtCurrency(Number(account.balance) || 0);
      }

      allTransactionsCache = transactions;
      elModalDateRange.textContent = currentDateRange;

      const filteredTransactions = filterTransactionsByDateRange(transactions, currentDateRange)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

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

    } catch (error) {
      console.error("Error loading transactions:", error);
      elModalTbody.innerHTML = '<tr><td colspan="4">Error loading transactions. Please try again.</td></tr>';
    }

    lastFocusedElementBeforeModal = document.activeElement;
    const closeBtn = elModal.querySelector(".modal-close");
    closeBtn?.focus();

    document.addEventListener("keydown", handleModalKeys);
    elModal.addEventListener("click", handleBackdropClick);
  }

  function closeTransactionModal() {
    elModal.style.display = "none";
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleModalKeys);
    elModal.removeEventListener("click", handleBackdropClick);
    currentAccount = null;
    currentAccountsList = null;

    if (lastFocusedElementBeforeModal) {
      lastFocusedElementBeforeModal.focus?.();
      lastFocusedElementBeforeModal = null;
    }
  }

  function handleModalKeys(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeTransactionModal();
    }
    if (e.key === "Tab") {
      const focusables = elModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleBackdropClick(e) {
    if (e.target === elModal) {
      closeTransactionModal();
    }
  }

  window.closeTransactionModal = closeTransactionModal;

  window.openDatePickerModal = function openDatePickerModal() {
    if (!currentAccount) return;
    
    const presets = ["Last 30 days", "Last 90 days", "Year to date", "All time"];
    const current = elModalDateRange.textContent?.trim();
    const nextIndex = (presets.indexOf(current) + 1) % presets.length;
    const next = presets[nextIndex];
    
    elModalDateRange.textContent = next;
    
    // Re-filter cached transactions instead of re-fetching
    const filteredTransactions = filterTransactionsByDateRange(allTransactionsCache, next)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

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
  };

  // Sidebar user menu
  if (userToggleBtn && userMenu) {
    userToggleBtn.addEventListener("click", () => {
      const expanded = userToggleBtn.getAttribute("aria-expanded") === "true";
      userToggleBtn.setAttribute("aria-expanded", String(!expanded));
      userMenu.style.display = expanded ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target) && !userToggleBtn.contains(e.target)) {
        userToggleBtn.setAttribute("aria-expanded", "false");
        userMenu.style.display = "none";
      }
    });
  }

  // Initialize and load real data from api
  
  try {
    // Show loading state
    if (elGrid) {
      elGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading accounts...</p>';
    }
    
    // Fetch accounts from backend
    const accounts = await fetchAccounts();
    
    if (accounts.length === 0) {
      elGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">No accounts found. Create your first account to get started!</p>';
      return;
    }
    
    // Create lookup map by ID
    const ACCOUNTS_BY_ID = new Map(accounts.map((a) => [a.id, a]));

    // Initial render
    renderAccounts(accounts);

    // Handle View Transactions button clicks
    elGrid.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-action="open-transactions"]');
      if (!btn) return;

      const accountId = btn.getAttribute("data-account-id");
      
      if (accountId === "all-accounts") {
        openTransactionModal({ id: "all-accounts" }, accounts);
      } else {
        const account = ACCOUNTS_BY_ID.get(accountId);
        if (account) {
          openTransactionModal(account);
        }
      }
    });
    
  } catch (error) {
    console.error("Error initializing accounts page:", error);
    showError("Failed to initialize page. Please refresh to try again.");
  }

  // Helper functions
  function formatDate(isoDate) {
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
});