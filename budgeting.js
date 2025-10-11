// Functionality for Monthly Budget
// Handle the Budget form submission
document.getElementById('budgetForm')?.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevents page from reloading when the form submits
  alert('Budget updated successfully!'); // Informs user the budget updated successfully
});

// Handles switching between tabs for monthly, weekly, and yearly budgets 
document.addEventListener("DOMContentLoaded", () => {
  // Selects all buttons
  document.querySelectorAll(".tab-btn, .tab-btn-active").forEach(btn => {
    // Ass a click event for each button
    btn.addEventListener("click", () => {
      // Reads which tab the user clicked
      const period = btn.dataset.period;
      // Mapping each tab to its corresponding html page
      const pages = {
        week:  "budgeting_week.html",
        month: "budgeting_month.html",
        year:  "budgeting_year.html"
      };
      window.location.href = pages[period]; // Redirects the user to the selected budgeting page
    });
  });
});