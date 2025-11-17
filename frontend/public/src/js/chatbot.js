// ========== DYNAMICALLY LOAD CHATBOT HTML ==========
document.addEventListener('DOMContentLoaded', () => {
  // Fetch and insert chatbot HTML
  fetch('chatbot.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      initializeChatbot();
    })
    .catch(error => console.error('Error loading chatbot:', error));
});

// ========== CHATBOT FUNCTIONALITY ==========
function initializeChatbot() {
  const chatbotBtn = document.querySelector('.chatbot');
  const chatbotWindow = document.querySelector('.chatbot-window');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const chatbotMessages = document.getElementById('chatbotMessages');

  // Sample responses for demo (you'll replace this with API later)
  const botResponses = {
    'hello': 'Hi there! How can I assist you with your finances today?',
    'hi': 'Hello! What can I help you with?',
    'budget': 'I can help you create and manage your budget! Would you like to set up a weekly, monthly, or yearly budget?',
    'help': 'I can help you with budgeting, tracking expenses, managing accounts, and answering questions about your finances. What would you like to know?',
    'account': 'You can view all your accounts on the Accounts page. Would you like me to show you your current balance?',
    'transfer': 'To make a transfer, go to the Transfers page. I can guide you through the process!',
    'default': 'I\'m still learning! Could you rephrase that or ask about budgets, accounts, or transfers?'
  };

  if (chatbotBtn) {
    // Open chatbot
    chatbotBtn.addEventListener('click', () => {
      chatbotWindow.classList.add('active');
      chatbotBtn.style.display = 'none';
      chatbotInput.focus();
    });

    // Close chatbot
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.remove('active');
      chatbotBtn.style.display = 'inline-flex';
    });

    // Send message on button click
    chatbotSend.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const message = chatbotInput.value.trim();
    
    if (message === '') return;

    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    chatbotInput.value = '';

    // Simulate bot thinking delay
    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, 'bot');
    }, 600);
  }

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${text}</p>
        <span class="message-time">${time}</span>
      </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for keywords
    for (let key in botResponses) {
      if (lowerMessage.includes(key)) {
        return botResponses[key];
      }
    }
    
    return botResponses['default'];
  }
}