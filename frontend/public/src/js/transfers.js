/* ======================================================================
  BloomFi - Transfers (transfers.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Keep track of which month we are looking at in each calendar
let transferCalendarMonth = new Date();
let recurringCalendarMonth = new Date();
let selectedTransferDate = null;
let selectedRecurringDate = null;

// The bank accounts we can transfer between
const accounts = [
  { id: 'checking', name: 'Checking', last4: '4567' },
  { id: 'savings', name: 'Savings', last4: '9876' }
];

// Transfers that are scheduled but have yet to have happened
const pendingTransfers = [
  { date: '2025-12-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-12-25', from: 'checking', to: 'savings', amount: 200.00 }
];

// Transfers that have already happened in the past
const transferHistory = [
  { date: '2025-09-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-10-18', from: 'checking', to: 'savings', amount: 598.00 },
  { date: '2025-09-18', from: 'checking', to: 'savings', amount: 150.00 },
  { date: '2025-08-18', from: 'checking', to: 'savings', amount: 598.00 }
];

// Information about the recurring transfers that happens automatically
const recurringTransfer = {
  nextDate: null,
  amount: null,
  from: '',
  to: '',
  frequency: ''
};

// Takes an account ID and returns a nicely formatted display name like "Checking •••• 4567"
function getAccountDisplay(accountId) {
  const account = accounts.find(acc => acc.id === accountId);
  return account ? `${account.name} •••• ${account.last4}` : '';
}

// Takes a date string and formats it to look like "Dec 18, 2025"
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Takes a number and formats it as currency like "$598.00"-- dollar sign
function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

// Creates the HTML for a single transfer item that shows all its details
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

// Fills in all the account dropdown menus with the available accounts
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

    // Remove all the old options except the first placeholder one
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Add each account as an option in the dropdown
    accounts.forEach(account => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = `${account.name} •••• ${account.last4}`;
      select.appendChild(option);
    });
  });
}

// Updates the list of pending transfers on the page
function renderPendingTransfers() {
  const listContainer = document.querySelector('[data-section="pending"] .transfer-list');
  if (!listContainer) return;

  listContainer.innerHTML = '';
  
  // If there are no pending transfers, show a message saying so
  if (pendingTransfers.length === 0) {
    listContainer.innerHTML = '<p class="no-transfers">No pending transfers</p>';
    return;
  }

  // Shows newest transfers first
  const sortedTransfers = [...pendingTransfers].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  sortedTransfers.forEach(transfer => {
    listContainer.appendChild(createTransferItem(transfer));
  });
}

// Updates the list of completed transfers on the page
function renderTransferHistory() {
  const listContainer = document.querySelector(".transfer-card:nth-of-type(4) .transfer-list");
  if (!listContainer) return;

  listContainer.innerHTML = '';
  
  // If there is no history, show a message saying so
  if (transferHistory.length === 0) {
    listContainer.innerHTML = '<p class="no-transfers">No transfer history</p>';
    return;
  }

  // Show newest transfers first
  const sortedHistory = [...transferHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  sortedHistory.forEach(transfer => {
    listContainer.appendChild(createTransferItem(transfer));
  });
}

// If there are already a recurring transfer set up, and load its details into the form
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

// This runs as soon as the page finishes loading
document.addEventListener("DOMContentLoaded", () => {
  // Fill in all the dynamic content on the page
  populateAccountDropdowns();
  renderPendingTransfers();
  renderTransferHistory();
  loadRecurringTransfer();

  // Set up the user menu dropdown in the top right
  const userToggle = document.getElementById("userToggle");
  const userMenu = document.getElementById("userMenu");
  
  if (userToggle && userMenu) {
    // When you click the user button, toggle the menu open or closed
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

    // If you click anywhere else on the page, close the menu
    document.addEventListener("click", () => {
      userToggle.setAttribute("aria-expanded", "false");
      userMenu.style.display = "none";
      const chevron = userToggle.querySelector(".chev");
      if (chevron) {
        chevron.style.transform = "rotate(0deg)";
      }
    });
  }

  // By default, set the transfer date to today
  selectedTransferDate = new Date();
  selectedTransferDate.setHours(0, 0, 0, 0);
  updateTransferDateDisplay();

  // HAndle when someone submits the "Make a Transfer" form
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

      // Make sure they selected both accounts
      if (!from || !to) {
        alert("Please choose both accounts.");
        return;
      }
      // Simply you cannot transfer to the same account
      if (from === to) {
        alert("Source and destination accounts must be different.");
        return;
      }
      // Amount has to be more than zero
      if (!(amt > 0)) {
        alert("Enter a valid amount greater than $0.00.");
        return;
      }
      // They need to pick a date
      if (!selectedTransferDate) {
        alert("Please select a transfer date.");
        return;
      }

      // Create a new transfer with all the info they entered
      const newTransfer = {
        date: selectedTransferDate.toISOString().split('T')[0],
        from: from,
        to: to,
        amount: amt
      };

      // Add it to the front of the pending transfers list
      pendingTransfers.unshift(newTransfer);
      
      // Update the list on the page to show the new transfer
      renderPendingTransfers();

      const dateStr = formatDate(newTransfer.date);
      alert(`Transfer submitted: ${formatCurrency(amt)} from ${getAccountDisplay(from)} to ${getAccountDisplay(to)} on ${dateStr}.`);

      // Clear out the form so they can make another transfer
      makeForm.reset();
      selectedTransferDate = new Date();
      selectedTransferDate.setHours(0, 0, 0, 0);
      updateTransferDateDisplay();
    });
  }

  // Handle when someone submits the recurring transfer form
  const recurForm = document.getElementById("recurringForm");
  if (recurForm) {
    recurForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const amountInput = document.getElementById('recurringAmount');
      const fromSelect = document.getElementById('recurringFrom');
      const toSelect = document.getElementById('recurringTo');
      const freqSelect = document.getElementById('recurringFrequency');
      
      // Save all the recurring transfer info
      recurringTransfer.nextDate = selectedRecurringDate ? selectedRecurringDate.toISOString().split('T')[0] : null;
      recurringTransfer.amount = amountInput.value ? parseFloat(amountInput.value) : null;
      recurringTransfer.from = fromSelect.value;
      recurringTransfer.to = toSelect.value;
      recurringTransfer.frequency = freqSelect.value;
      
      alert("Recurring transfer updated.");
    });
  }

  // If you click outside a calendar pop up, close it
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

// Functions for the regular transfer date picker
// Opens the calendar popup for picking a transfer date
function openTransferDatePicker() {
  const modal = document.getElementById("transferDatePickerModal");
  
  // Show the month that contains the currently selected date, or today if nothing is selected
  transferCalendarMonth = selectedTransferDate ? new Date(selectedTransferDate) : new Date();
  
  renderTransferCalendar();
  modal.style.display = "flex";
}

// Closes the transfer date picker popup
function closeTransferDatePicker() {
  const modal = document.getElementById("transferDatePickerModal");
  modal.style.display = "none";
}

// Confirms the date they picked and closes the popup
function applyTransferDate() {
  if (!selectedTransferDate) {
    alert("Please select a date first.");
    return;
  }
  
  // Save the date in a hidden form field
  const hiddenInput = document.getElementById("transferDate");
  if (hiddenInput) {
    hiddenInput.value = selectedTransferDate.toISOString().split('T')[0];
  }
  
  updateTransferDateDisplay();
  closeTransferDatePicker();
}

// Updates the display to show which date is currently selected
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

// Moves to the previous or next month in the calendar
// Direction is -1 for previous month, +1 for next month
function changeTransferMonth(direction) {
  transferCalendarMonth.setMonth(transferCalendarMonth.getMonth() + direction);
  renderTransferCalendar();
}

// Draws the entire calendar grid with all the days
function renderTransferCalendar() {
  const calendarDays = document.getElementById("transferCalendarDays");
  const calendarMonthYear = document.getElementById("transferCalendarMonthYear");
  
  if (!calendarDays || !calendarMonthYear) return;
  
  // Show which month and year we're looking at
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[transferCalendarMonth.getMonth()]} ${transferCalendarMonth.getFullYear()}`;
  
  // Remove all the old day boxes
  calendarDays.innerHTML = '';
  
  // Figure out what day of the week the month starts on
  const firstDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), 1);
  const lastDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth() + 1, 0);
  const prevLastDay = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), 0);
  
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Fill in the empty spots at the start with days from the previous month
  for (let i = firstDayIndex; i > 0; i--) {
    const day = createDayElement(prevLastDate - i + 1, 'other-month');
    calendarDays.appendChild(day);
  }
  
  // Add all the days of the current month
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(transferCalendarMonth.getFullYear(), transferCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    // You cannot pick dates in the past
    if (date < today) {
      dayEl.classList.add('disabled');
    } else {
      // If it is today or in the future, you can click it to select it
      dayEl.addEventListener('click', () => selectTransferDate(date));
    }
    
    // Highlight today's date
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    // Show which date is currently selected
    if (selectedTransferDate && date.getTime() === selectedTransferDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
    calendarDays.appendChild(dayEl);
  }
  
  // Fill in the remaining spots with days from the next month
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    const day = createDayElement(i, 'other-month');
    calendarDays.appendChild(day);
  }
}

// When someone clicks a date, remember it as the selected date
function selectTransferDate(date) {
  selectedTransferDate = date;
  updateTransferDateDisplay();
  renderTransferCalendar();
}

// Functions for the recurring transfer date picker
// for the recurring transfer calendar 

function openRecurringDatePicker() {
  const modal = document.getElementById("recurringDatePickerModal");
  
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
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[recurringCalendarMonth.getMonth()]} ${recurringCalendarMonth.getFullYear()}`;
  
  calendarDays.innerHTML = '';
  
  const firstDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), 1);
  const lastDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth() + 1, 0);
  const prevLastDay = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), 0);
  
  const firstDayIndex = firstDay.getDay();
  const lastDateOfMonth = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = firstDayIndex; i > 0; i--) {
    const day = createDayElement(prevLastDate - i + 1, 'other-month');
    calendarDays.appendChild(day);
  }
  
  for (let i = 1; i <= lastDateOfMonth; i++) {
    const date = new Date(recurringCalendarMonth.getFullYear(), recurringCalendarMonth.getMonth(), i);
    date.setHours(0, 0, 0, 0);
    
    const dayEl = createDayElement(i, '');
    
    if (date < today) {
      dayEl.classList.add('disabled');
    } else {
      dayEl.addEventListener('click', () => selectRecurringDate(date));
    }
    
    if (date.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    if (selectedRecurringDate && date.getTime() === selectedRecurringDate.getTime()) {
      dayEl.classList.add('selected');
    }
    
    calendarDays.appendChild(dayEl);
  }
  
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

// Helper function used by both calendars to create a single day box
function createDayElement(dayNumber, className) {
  const dayEl = document.createElement('div');
  dayEl.className = `calendar-day ${className}`;
  dayEl.textContent = dayNumber;
  return dayEl;
}