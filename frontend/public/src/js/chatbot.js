/* ======================================================================
  BloomFi - Chatbot (chatbot.js)
  Author: Samantha Saunsaucie 
  Date: 11/03/2025
   ====================================================================== */

// Chatbot configuration settings
const CHATBOT_CONFIG = {
  apiEndpoint: '/api/chatbot/message', // Future FastAPI endpoint
  useBackend: false, // Set to true when backend is ready
  mockDelay: 600, // Simulated response delay in milliseconds
  initialMessage: {
    text: "Hello! I'm your BloomFi assistant. How can I help you manage your finances today?",
    sender: 'bot',
    timestamp: new Date().toISOString()
  }
};

// Service layer - handles all data communication
class ChatbotService {
  constructor(config) {
    this.config = config;
    
    // Mock responses for demo mode
    this.mockResponses = {
      'hello': 'Hi there! How can I assist you with your finances today?',
      'hi': 'Hello! What can I help you with?',
      'hey': 'Hello! What can I help you with?',
      'budget': 'I can help you create and manage your budget! Would you like to set up a weekly, monthly, or yearly budget?',
      'help': 'I can help you with budgeting, tracking expenses, managing accounts, and answering questions about your finances. What would you like to know?',
      'account': 'You can view all your accounts on the Accounts page. Would you like me to show you your current balance?',
      'transfer': 'To make a transfer, go to the Transfers page. I can guide you through the process!',
      'default': 'I\'m still learning! Could you rephrase that or ask about budgets, accounts, or transfers?'
    };
  }

  // Main message sending method - routes to backend or mock
  async sendMessage(message) {
    if (this.config.useBackend) {
      return await this.sendToBackend(message);
    } else {
      return await this.getMockResponse(message);
    }
  }

  // Send message to FastAPI backend
  async sendToBackend(message) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers when needed
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.response || data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('Backend communication error:', error);
      // Fallback to mock response if backend fails
      return await this.getMockResponse(message);
    }
  }

  // Generate mock response based on keywords
  async getMockResponse(message) {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, this.config.mockDelay));

    const lowerMessage = message.toLowerCase();
    let responseText = this.mockResponses['default'];

    // Check message for keywords and return matching response
    for (let key in this.mockResponses) {
      if (lowerMessage.includes(key)) {
        responseText = this.mockResponses[key];
        break;
      }
    }

    return {
      text: responseText,
      timestamp: new Date().toISOString(),
      metadata: { source: 'mock' }
    };
  }
}

// UI layer - handles all user interface interactions
class ChatbotUI {
  constructor(service, config) {
    this.service = service;
    this.config = config;
    this.elements = {}; // Cached DOM elements
    this.isProcessing = false; // Prevent multiple simultaneous sends
  }

  // Set up chatbot UI
  initialize() {
    if (!this.cacheElements()) {
      console.error('Chatbot elements not found in DOM');
      return;
    }
    this.attachEventListeners();
    this.renderInitialMessage();
  }

  // Cache all required DOM elements for performance
  cacheElements() {
    this.elements = {
      chatbotBtn: document.querySelector('.chatbot'),
      chatbotWindow: document.querySelector('.chatbot-window'),
      chatbotClose: document.querySelector('.chatbot-close'),
      chatbotInput: document.getElementById('chatbotInput'),
      chatbotSend: document.getElementById('chatbotSend'),
      chatbotMessages: document.getElementById('chatbotMessages')
    };

    // Verify all required elements exist
    return Object.values(this.elements).every(el => el !== null);
  }

  // Attach all event listeners
  attachEventListeners() {
    const { chatbotBtn, chatbotClose, chatbotInput, chatbotSend } = this.elements;

    chatbotBtn.addEventListener('click', () => this.openChatbot());
    chatbotClose.addEventListener('click', () => this.closeChatbot());
    chatbotSend.addEventListener('click', () => this.handleSendMessage());
    
    // Allow sending message with Enter key
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isProcessing) {
        this.handleSendMessage();
      }
    });
  }

  // Open chatbot window
  openChatbot() {
    this.elements.chatbotWindow.classList.add('active');
    this.elements.chatbotBtn.style.display = 'none';
    this.elements.chatbotInput.focus();
  }

  // Close chatbot window
  closeChatbot() {
    this.elements.chatbotWindow.classList.remove('active');
    this.elements.chatbotBtn.style.display = 'inline-flex';
  }

  // Handle sending user message and getting bot response
  async handleSendMessage() {
    const message = this.elements.chatbotInput.value.trim();
    
    // Prevent empty messages or duplicate sends
    if (message === '' || this.isProcessing) return;

    // Disable input while processing
    this.isProcessing = true;
    this.elements.chatbotInput.disabled = true;
    this.elements.chatbotSend.disabled = true;

    // Display user message
    this.addMessage({
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
    
    this.elements.chatbotInput.value = '';

    try {
      // Get bot response from service layer
      const response = await this.service.sendMessage(message);
      
      // Display bot response
      this.addMessage({
        text: response.text,
        sender: 'bot',
        timestamp: response.timestamp,
        metadata: response.metadata
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message to user
      this.addMessage({
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      });
    } finally {
      // Re-enable input
      this.isProcessing = false;
      this.elements.chatbotInput.disabled = false;
      this.elements.chatbotSend.disabled = false;
      this.elements.chatbotInput.focus();
    }
  }

  // Add message to chat display
  addMessage({ text, sender, timestamp, metadata = {} }) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    const time = this.formatTime(timestamp);
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${this.escapeHtml(text)}</p>
        <span class="message-time">${time}</span>
      </div>
    `;
    
    // Store metadata for debugging if present
    if (Object.keys(metadata).length > 0) {
      messageDiv.dataset.metadata = JSON.stringify(metadata);
    }
    
    this.elements.chatbotMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  // Display initial welcome message
  renderInitialMessage() {
    // Only show if messages container is empty
    if (this.elements.chatbotMessages.children.length === 0) {
      this.addMessage(this.config.initialMessage);
    }
  }

  // Auto-scroll to show newest message
  scrollToBottom() {
    this.elements.chatbotMessages.scrollTop = this.elements.chatbotMessages.scrollHeight;
  }

  // Format timestamp for display
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }

  // Helper function for escaping HTML in user input
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load chatbot HTML template
  fetch('chatbot.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load chatbot.html: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      // Insert chatbot HTML into page
      document.body.insertAdjacentHTML('beforeend', html);
      
      // Create and initialize chatbot
      const chatbotService = new ChatbotService(CHATBOT_CONFIG);
      const chatbotUI = new ChatbotUI(chatbotService, CHATBOT_CONFIG);
      chatbotUI.initialize();
    })
    .catch(error => console.error('Error loading chatbot:', error));
});