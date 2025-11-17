// === GLOBAL STATE FOR CALENDARS ===
let transferCalendarMonth = new Date();
let recurringCalendarMonth = new Date();
let selectedTransferDate = null;
let selectedRecurringDate = null;

// === DYNAMIC DATA ===
const accounts = [
  { id: 'checking', name: 'Checking', last4: '4567' },
  { id: 'savings', name: 'Savings', last4: '9876' }
];

const pendingTransfers = [
  { date: '2025-12-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-12-25', from: 'checking', to: 'savings', amount: 200.00 }
];

const transferHistory = [
  { date: '2025-09-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-10-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-09-18', from: 'checking', to: 'savings', amount: 150.00 },
  { date: '2025-08-18', from: 'checking', to: 'savings', amount: 598.00 }
];

const recurringTransfer = {
  nextDate: null,
  amount: null,
  from: '',
  to: '',
  frequency: ''
};

// === HELPER FUNCTIONS ===
function getAccountDisplay(accountId) {
  const account = accounts.find(acc => acc.id === accountId);
  return account ? `${account.name} •••• ${account.last4}` : '';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

function createTransferItem(transfer) {
  const div = document.createElement("div");
  div.className = "transfer-item";
  div.innerHTML = `
    <div><strong>Date:</strong> ${formatDate(transfer.date)}</div>
    <div><strong>From:</strong> ${getAccountDisplay(transfer.from)}</div>
    <div><strong>To:</strong> ${getAccountDisplay(transfer.to)}</div>
    <div class="amt"><strong>Amount:</strong> ${formatCurrency(transfer.amount)}</div>
  `;
  return div;
}

function populateAccountDropdowns() {
  const dropdowns = [
    'fromAccount',
    'toAccount',
    'recurringFrom',
    'recurringTo'
  ];

  dropdowns.forEach(dropdownId => {
    const select = document.getElementById(dropdownId);
    if (!select) return;

    // Clear existing options except the first one
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add account options
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = `${account.name} •••• ${account.last4}`;
      select.appendChild(option);
    });
  });
}

function renderPendingTransfers() {
  const listContainer = document.querySelector(".transfer-card:nth-of-type(2) .transfer-list");
  if (!listContainer) return;

  listContainer.innerHTML = '';
  
  if (pendingTransfers.length === 0) {
    listContainer.innerHTML = '<p class="no-transfers">No pending transfers</p>';
    return;
  }

  // Sort by date (newest first)
  const sortedTransfers = [...pendingTransfers].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  sortedTransfers.forEach(transfer => {
    listContainer.appendChild(createTransferItem(transfer));
  });
}

function renderTransferHistory() {
  const listContainer = document.querySelector(".transfer-card:nth-of-type(4) .transfer-list");
  if (!listContainer) return;

  listContainer.innerHTML = '';
  
  if (transferHistory.length === 0) {
    listContainer.innerHTML = '<p class="no-transfers">No transfer history</p>';
    return;
  }

  // Sort by date (newest first)
  const sortedHistory = [...transferHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  sortedHistory.forEach(transfer => {
    listContainer.appendChild(createTransferItem(transfer));
  });
}

function loadRecurringTransfer() {
  if (recurringTransfer.nextDate) {
    selectedRecurringDate = new Date(recurringTransfer.nextDate);
    updateRecurringDateDisplay();
  }
  
  const amountInput = document.getElementById('recurringAmount');
  const fromSelect = document.getElementById('recurringFrom');
  const toSelect = document.getElementById('recurringTo');
  const freqSelect = document.getElementById('recurringFrequency');
  
  if (amountInput && recurringTransfer.amount) {
    amountInput.value = recurringTransfer.amount;
  }
  if (fromSelect && recurringTransfer.from) {
    fromSelect.value = recurringTransfer.from;
  }
  if (toSelect && recurringTransfer.to) {
    toSelect.value = recurringTransfer.to;
  }
  if (freqSelect && recurringTransfer.frequency) {
    freqSelect.value = recurringTransfer.frequency;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // === INITIALIZE DYNAMIC CONTENT ===
  populateAccountDropdowns();
  renderPendingTransfers();
  renderTransferHistory();
  loadRecurringTransfer();

  // === USER MENU TOGGLE ===
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

  // Set default transfer date to today
  selectedTransferDate = new Date();
  selectedTransferDate.setHours(0, 0, 0, 0);
  updateTransferDateDisplay();

  // === MAKE A TRANSFER FORM ===
  const makeForm = document.getElementById("makeTransferForm");
  if (makeForm) {
    const fromSel = document.getElementById("fromAccount");
    const toSel = document.getElementById("toAccount");
    const amtInp = document.getElementById("amount");

    makeForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const from = fromSel.value;
      const to = toSel.value;
      const amt = parseFloat(amtInp.value || "0");

      if (!from || !to) {
        alert("Please choose both accounts.");
        return;
      }
      if (from === to) {
        alert("Source and destination accounts must be different.");
        return;
      }
      if (!(amt > 0)) {
        alert("Enter a valid amount greater than $0.00.");
        return;
      }
      if (!selectedTransferDate) {
        alert("Please select a transfer date.");
        return;
      }

      // Create new transfer object
      const newTransfer = {
        date: selectedTransferDate.toISOString().split('T')[0],
        from: from,
        to: to,
        amount: amt
      };

      // Add to pending transfers
      pendingTransfers.unshift(newTransfer);
      
      // Re-render pending transfers list
      renderPendingTransfers();

      const dateStr = formatDate(newTransfer.date);
      alert(`Transfer submitted: ${formatCurrency(amt)} from ${getAccountDisplay(from)} to ${getAccountDisplay(to)} on ${dateStr}.`);

      // Reset form
      makeForm.reset();
      selectedTransferDate = new Date();
      selectedTransferDate.setHours(0, 0, 0, 0);
      updateTransferDateDisplay();
    });
  }

  // === RECURRING TRANSFER FORM ===
  const recurForm = document.getElementById("recurringForm");
  if (recurForm) {
    recurForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const amountInput = document.getElementById('recurringAmount');
      const fromSelect = document.getElementById('recurringFrom');
      const toSelect = document.getElementById('recurringTo');
      const freqSelect = document.getElementById('recurringFrequency');
      
      // Update recurring transfer object
      recurringTransfer.nextDate = selectedRecurringDate ? selectedRecurringDate.toISOString().split('T')[0] : null;
      recurringTransfer.amount = amountInput.value ? parseFloat(amountInput.value) : null;
      recurringTransfer.from = fromSelect.value;
      recurringTransfer.to = toSelect.value;
      recurringTransfer.frequency = freqSelect.value;
      
      alert("Recurring transfer updated.");
    });
  }

  // === CLOSE MODALS ON OUTSIDE CLICK ===
  window.addEventListener('click', (e) => {
    const transferModal = document.getElementById("transferDatePickerModal");
    const recurringModal = document.getElementById("recurringDatePickerModal");
    
    if (e.target === transferModal) {
      closeTransferDatePicker();
    }
    if (e.target === recurringModal) {
      closeRecurringDatePicker();
    }
  });
});

// ========================================
// TRANSFER DATE PICKER FUNCTIONS
// ========================================

function openTransferDatePicker() {
  const modal = document.getElementById("transferDatePickerModal");
  
  // Set calendar to current selection or today
  transferCalendarMonth = selectedTransferDate ? new Date(selectedTransferDate) : new Date();
  
  renderTransferCalendar();
  modal.style.display = "flex";
}

function closeTransferDatePicker() {
  const modal = document.getElementById("transferDatePickerModal");
  modal.style.display = "none";
}

function applyTransferDate() {
  if (!selectedTransferDate) {
    alert("Please select a date first.");
    return;
  }
  
  // Update hidden input and display
  const hiddenInput = document.getElementById("transferDate");
  if (hiddenInput) {
    hiddenInput.value = selectedTransferDate.toISOString().split('T')[0];
  }
  
  updateTransferDateDisplay();
  closeTransferDatePicker();
}

function updateTransferDateDisplay() {
  const displayEl = document.getElementById("transferDateDisplay");
  const selectedEl = document.getElementById("selectedTransferDate");
  
  if (!selectedTransferDate) {
    if (displayEl) displayEl.textContent = "Select date";
    if (selectedEl) selectedEl.textContent = "Select date";
    return;
  }
  
  const formatted = selectedTransferDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  if (displayEl) displayEl.textContent = formatted;
  if (selectedEl) selectedEl.textContent = formatted;
}

function changeTransferMonth(direction) {
  transferCalendarMonth.setMonth(transferCalendarMonth.getMonth() + direction);
  renderTransferCalendar();
}

function renderTransferCalendar() {
  const calendarDays = document.getElementById("transferCalendarDays");
  const calendarMonthYear = document.getElementById("transferCalendarMonthYear");
  
  if (!calendarDays || !calendarMonthYear) return;
  
  // Set month/year display
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[transferCalendarMonth.getMonth()]} ${transferCalendarMonth.getFullYear()}`;
  
  // Clear previous days
  calendarDays.innerHTML = '';
  
  // Get first day of month
  const firstDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), 1);
  const lastDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth() + 1, 0);
  const prevLastDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), 0);
  
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
    const date = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    // Disable past dates
    if (date < today) {
      dayEl.classList.add('disabled');
    } else {
      // Add click handler only for future/today dates
      dayEl.addEventListener('click', () => selectTransferDate(date));
    }
    
    // Check if today
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    // Check if selected
    if (selectedTransferDate && date.getTime() === selectedTransferDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
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

function selectTransferDate(date) {
  selectedTransferDate = date;
  updateTransferDateDisplay();
  renderTransferCalendar();
}

// ========================================
// RECURRING DATE PICKER FUNCTIONS
// ========================================

function openRecurringDatePicker() {
  const modal = document.getElementById("recurringDatePickerModal");
  
  // Set calendar to current selection or today
  recurringCalendarMonth = selectedRecurringDate ? new Date(selectedRecurringDate) : new Date();
  
  renderRecurringCalendar();
  modal.style.display = "flex";
}

function closeRecurringDatePicker() {
  const modal = document.getElementById("recurringDatePickerModal");
  modal.style.display = "none";
}

function applyRecurringDate() {
  if (!selectedRecurringDate) {
    alert("Please select a date first.");
    return;
  }
  
  // Update hidden input and display
  const hiddenInput = document.getElementById("nextTransfer");
  if (hiddenInput) {
    hiddenInput.value = selectedRecurringDate.toISOString().split('T')[0];
  }
  
  updateRecurringDateDisplay();
  closeRecurringDatePicker();
}

function updateRecurringDateDisplay() {
  const displayEl = document.getElementById("recurringDateDisplay");
  const selectedEl = document.getElementById("selectedRecurringDate");
  
  if (!selectedRecurringDate) {
    if (displayEl) displayEl.textContent = "Select date";
    if (selectedEl) selectedEl.textContent = "Select date";
    return;
  }
  
  const formatted = selectedRecurringDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  if (displayEl) displayEl.textContent = formatted;
  if (selectedEl) selectedEl.textContent = formatted;
}

function changeRecurringMonth(direction) {
  recurringCalendarMonth.setMonth(recurringCalendarMonth.getMonth() + direction);
  renderRecurringCalendar();
}

function renderRecurringCalendar() {
  const calendarDays = document.getElementById("recurringCalendarDays");
  const calendarMonthYear = document.getElementById("recurringCalendarMonthYear");
  
  if (!calendarDays || !calendarMonthYear) return;
  
  // Set month/year display
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[recurringCalendarMonth.getMonth()]} ${recurringCalendarMonth.getFullYear()}`;
  
  // Clear previous days
  calendarDays.innerHTML = '';
  
  // Get first day of month
  const firstDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), 1);
  const lastDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth() + 1, 0);
  const prevLastDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), 0);
  
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
    const date = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    // Disable past dates
    if (date < today) {
      dayEl.classList.add('disabled');
    } else {
      // Add click handler only for future/today dates
      dayEl.addEventListener('click', () => selectRecurringDate(date));
    }
    
    // Check if today
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    // Check if selected
    if (selectedRecurringDate && date.getTime() === selectedRecurringDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
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

function selectRecurringDate(date) {
  selectedRecurringDate = date;
  updateRecurringDateDisplay();
  renderRecurringCalendar();
}

// ========================================
// SHARED HELPER FUNCTIONS
// ========================================

function createDayElement(dayNumber, className) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`;
  dayEl.textContent = dayNumber;
  return dayEl;
}