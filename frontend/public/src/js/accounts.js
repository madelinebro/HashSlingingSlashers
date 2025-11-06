// Functionality for My Accounts Component
(() => {
  // Get the table body element, which the rows will be displayed on page
  const tbody = document.getElementById('accountTbody');
  if (!tbody) return; // Exit if element are not found

  // Example of account data
  const accounts = [
    { label: 'Checking', amount: 9522.45, currency: 'USD' },
    { label: 'Savings', amount: 12489.98, currency: 'USD', meta: 'Available' },
  ];

  //Formats number as a currency (USD)
  const fmt = (n, cur = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n);

  // Builds table; for every account in list, makes one table row
  // Formats table and adds divider line between rows
  // Creates headers for Accounts name and the amount in each
  //Formats the currency
  // a.meta shows the available currencies, if there are any
  function render() {
    tbody.innerHTML = accounts
      .map(
        (a, i) => `
        <tr${i > 0 ? ' class="divider"' : ''}>  
          <th scope="row">${a.label}</th>
          <td class="amount">
            ${fmt(a.amount, a.currency)} <span class="currency">${a.currency}</span> 
            ${a.meta ? `<div class="meta">${a.meta}</div>` : ''}
          </td>
        </tr>`
      )
      .join(''); // Combine all rows into one HTML string
  }

  render();
})();