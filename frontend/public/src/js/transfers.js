// Functionality for Payment Transfers
// Handle making a transfer form submission
document.getElementById('makeTransferForm')?.addEventListener('submit', e => {
  e.preventDefault(); // prevents page from reloading when form is submitted
  alert('Transfer submitted successfully!'); // Displays confirmation msg
});
//Handle recurring transfers from submission
document.getElementById('recurringForm')?.addEventListener('submit', e => {
  e.preventDefault(); // prevents page from reloading when form is submitted
  alert('Recurring transfer updated!'); // Displays confirmation msg
});