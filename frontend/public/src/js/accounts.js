/* ======================================================================
   BloomFi - My Accounts (accounts.js)
   Responsible for:
   - Rendering accounts grid from data
   - Updating totals (count + sum of balances)
   - Opening/closing Transactions modal with transactions table
   - Date-range stub + accessibility & keyboard handling
   - Sidebar user menu toggle
   ====================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const SAMPLE_ACCOUNTS = [
    {
      id: "chk-001",
      name: "Checking",
      number: "**** 1234",
      color: "teal",
      icon: "💵",
      balance: 3120.58,
      available: 3050.22,
      pending: -45.12,
      transactions: [
        { id: "t1", desc: "Deposit - Payroll", date: "2025-10-28", amount: 1850, type: "income" },
        { id: "t2", desc: "Rent", date: "2025-11-01", amount: -1200, type: "expense" },
        { id: "t3", desc: "Coffee Shop", date: "2025-11-03", amount: -5.75, type: "expense" },
        { id: "t4", desc: "Transfer to Savings", date: "2025-11-04", amount: -150, type: "transfer" },
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
        { id: "t5", desc: "Interest Payment", date: "2025-10-31", amount: 6.84, type: "income" },
        { id: "t6", desc: "Transfer from Checking", date: "2025-11-04", amount: 150, type: "income" },
      ],
    },
    {
      id: "crd-001",
      name: "BloomFi Rewards Card",
      number: "**** 5521",
      color: "green",
      icon: "💳",
      balance: -0.25, // credit card current balance (negative means you owe)
      available: 2450.75, // remaining credit, if you want to show it this way
      pending: -35.9,
      transactions: [
        { id: "t7", desc: "Groceries", date: "2025-11-02", amount: -86.12, type: "expense" },
        { id: "t8", desc: "Gas", date: "2025-11-04", amount: -35.9, type: "expense" },
        { id: "t9", desc: "Rewards Credit", date: "2025-11-05", amount: 5, type: "income" },
      ],
    },
  ];

  /* --------------------------------
     2) DOM getters / cached elements
     -------------------------------- */
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

  /* -----------------------
     3) Utility: formatting
     ----------------------- */
  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

  const classForAmount = (amount) => (amount >= 0 ? "amount positive" : "amount negative");

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

  /* ----------------------------------------------------
     4) Render accounts grid + totals from a data source
     ---------------------------------------------------- */
  function renderAccounts(accounts) {
    // Update totals
    const total = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    if (elTotalBalance) elTotalBalance.textContent = fmtCurrency(total);
    if (elTotalAccounts) elTotalAccounts.textContent = accounts.length.toString();

    // Build "All Accounts" card + individual account cards
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
    // Ensure safe text
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

  /* ---------------------------------------------
     5) Modal: open/close + render transactions
     --------------------------------------------- */
  let currentAccount = null;
  let lastFocusedElementBeforeModal = null;

  function openTransactionModal(account, allAccounts = null) {
    currentAccount = account;

    if (account.id === "all-accounts" && allAccounts) {
      elModalName.textContent = "All Accounts — Transactions";
      elModalNumber.textContent = `${allAccounts.length} account${allAccounts.length !== 1 ? 's' : ''}`;
      const totalBalance = allAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
      elModalBalance.textContent = fmtCurrency(totalBalance);
      elModalDateRange.textContent = "Last 30 days";

      // Aggregate transactions from all accounts
      const allTransactions = allAccounts.flatMap(a => a.transactions || [])
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      elModalTbody.innerHTML =
        allTransactions
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
    } else {
      elModalName.textContent = account.name + " — Transactions";
      elModalNumber.textContent = account.number;
      elModalBalance.textContent = fmtCurrency(Number(account.balance) || 0);
      elModalDateRange.textContent = "Last 30 days";

      elModalTbody.innerHTML =
        account.transactions
          .slice()
          .sort((a, b) => (a.date < b.date ? 1 : -1))
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

    // Open modal
    lastFocusedElementBeforeModal = document.activeElement;
    elModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Move focus to close button
    const closeBtn = elModal.querySelector(".modal-close");
    closeBtn?.focus();

    // Set basic focus trap
    document.addEventListener("keydown", handleModalKeys);
    elModal.addEventListener("click", handleBackdropClick);
  }

  function closeTransactionModal() {
    elModal.style.display = "none";
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleModalKeys);
    elModal.removeEventListener("click", handleBackdropClick);
    currentAccount = null;

    // restore focus
    if (lastFocusedElementBeforeModal) {
      lastFocusedElementBeforeModal.focus?.();
      lastFocusedElementBeforeModal = null;
    }
  }

  // Support ESC + simple tab trap
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

  // Expose for inline onclick in HTML
  window.closeTransactionModal = closeTransactionModal;

  /* ------------------------------------
     6) Date range stub (click to change)
     ------------------------------------ */
  window.openDatePickerModal = function openDatePickerModal() {
    if (!currentAccount) return;
    // Minimal stub: cycle a few presets. Replace with your real date picker later.
    const presets = ["Last 30 days", "Last 90 days", "Year to date", "All time"];
    const current = elModalDateRange.textContent?.trim();
    const next = presets[(presets.indexOf(current) + 1) % presets.length];
    elModalDateRange.textContent = next;

    // If you want to actually filter transactions by date, do it here:
    // 1) compute start date from preset
    // 2) filter currentAccount.transactions
    // 3) re-render tbody exactly like in openTransactionModal()
  };

  /* ---------------------------------------
     7) Sidebar user menu (open/close toggle)
     --------------------------------------- */
  if (userToggleBtn && userMenu) {
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

  /* ---------------------------------------------------------
     8) Event delegation: "View Transactions" buttons in grid
     --------------------------------------------------------- */
  /* ------------------------------------
     8) Initialize from data / (fake) API
     ------------------------------------ */
  // In the future, swap this for a real fetch:
  // const accounts = await fetch('/api/accounts').then(r => r.json());
  const accounts = SAMPLE_ACCOUNTS;
  const ACCOUNTS_BY_ID = new Map(accounts.map((a) => [a.id, a]));

  renderAccounts(accounts);

  /* ---------------------------------------------------------
     9) Event delegation: "View Transactions" buttons in grid
     --------------------------------------------------------- */
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

  /* -------------------------
     10) Small helper functions
     ------------------------- */
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