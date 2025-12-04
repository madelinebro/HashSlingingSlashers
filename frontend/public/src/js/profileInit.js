/* ======================================================================
  BloomFi - Apply Profile Picture to Page (profileInit.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Wait for the page to fully load before running any code
document.addEventListener('DOMContentLoaded', () => {
  // Check if the profile service exists 
  // If it does exist, tell it to update all profile pictures on the pages
  if (typeof profileService !== 'undefined') {
    profileService.applyProfilePictureToPage();
  }
});
