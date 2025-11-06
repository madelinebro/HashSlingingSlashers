// Wait until html document is loaded before running
document.addEventListener("DOMContentLoaded", () => {
  // Find the element in which rows will be inserted
  const txBody = document.getElementById("txBody");

  // Load example transactions
  if (txBody) {
    // Sample transaction data
    const transactions = [
      { desc: "Electric Bill", date: "2025-10-08", amount: -120.75, account: "****3456" },
      { desc: "Paycheck", date: "2025-10-05", amount: 2500.00, account: "****3456" },
      { desc: "Grocery Store", date: "2025-10-04", amount: -89.45, account: "****7890" },
      { desc: "Streaming Subscription", date: "2025-10-03", amount: -12.99, account: "****7890" },
    ];
    // Formats amounts as US dollars
    const fmt = (n) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(n);

    // Generates the rows for each transactions
    // loops over each transaction and creates a row with cells for each field
    // describes the transaction, date, amount (warning for neg and secondary for pos)
    txBody.innerHTML = transactions
      .map(
        (t) => `
        <tr>
          <td>${t.desc}</td>
          <td>${t.date}</td>
          <td style="color:${t.amount < 0 ? "var(--warning)" : "var(--secondary)"};">
            ${fmt(t.amount)}
          </td>
          <td>${t.account}</td>
        </tr>`
      )
      .join(""); // Joins all rows into single html string and inserts them into the table
  }

  // Logout functionality
  // FInds the log out link inside dropdown menu
  const logoutLink = document.querySelector(".user-menu a[href='login.html']");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault(); // prevents immediate interaction
      localStorage.removeItem("loggedIn"); // simulate logging out
      window.location.href = "login.html"; // redirect user to the login page
    });
  }
});
