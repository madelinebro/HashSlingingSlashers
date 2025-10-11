// Functionality for Main Components
// Light/Dark theme switch, can use toggle
const themeTog = document.getElementById('themeToggle'); 

if (themeTog) {
  // Check if theme preference is already saved
  const saved = localStorage.getItem('theme');
  // And apply the saved theme
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  // When user click the toggle button
  themeTog.addEventListener('click', () => {
    // Gets the current theme--if light, switch to dark
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    // Apply the new theme
    document.documentElement.setAttribute('data-theme', cur);
    // Save the user's choice
    localStorage.setItem('theme', cur);
  });
}

// User dropdown for Profile options
// Select toggle and the user menu
const userToggle = document.getElementById('userToggle');
const userMenu = document.getElementById('userMenu');
// when the user clicks their name, show or hide the dropdown menu
userToggle?.addEventListener('click', () => {
  userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
});
// Close if the user clicks anywhere else on the page
document.addEventListener('click', (e) => {
  if (!userMenu) return; // stop if menu does not exist
  // if click is not inside the menu and not on toggle, hide it
  if (!userMenu.contains(e.target) && !userToggle.contains(e.target)) userMenu.style.display = 'none';
});

// Chatbot button, which will show message when clicked
document.querySelector('.chatbot')?.addEventListener('click', () => {
  alert('Chatbot coming soon!');
});
