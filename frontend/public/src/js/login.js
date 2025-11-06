// Wait until html document is loaded before running
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  window.location.href = "dashboard.html"; // redirect to dashboard
});