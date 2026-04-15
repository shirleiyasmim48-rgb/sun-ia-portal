// Estado global
const state = {
  token: localStorage.getItem('sun_ia_token'),
  currentMode: 'chat',
  isTyping: false,
  hasAdmin: false
};

// Elementos DOM
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const setupForm = document.getElementById('setup-form');
const loginError = document.getElementById('login-error');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const logoutBtn = document.getElementById('logout-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  
  if (state.token) {
    showScreen('main');
  } else {
    showScreen('login');
  }
  
  setupEventListeners();
});

// Verifica se o sistema já tem administrador
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    state.hasAdmin = data.hasAdmin;
    
    if (data.hasAdmin) {
      loginForm.classList.remove('hidden');
      setupForm.classList.add('hidden');
    } else {
      setupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  } catch (err) {
    console.error('Erro de conexão:', err);
    loginForm.classList.remove('hidden');
    loginError.innerText = 'Conectando ao servidor...';
  }
}

// Navegação
function showScreen(screenId) {
  if (screenId === 'login') {
    loginScreen.classList.add('active');
    mainScreen.classList.remove('active');
  } else {
    loginScreen.classList.remove('active');
    mainScreen.classList.add('active');
  }
}

// Event Listeners
function setupEventListeners() {
  // Menu Mobile
  menuToggle.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        state.token = data.token;
        localStorage.setItem('sun_ia_token', data.token);
        showScreen('main');
      } else {
        loginError.innerText = data.error || 'Usuário ou senha incorretos.';
      }
    } catch (err) {
      loginError.innerText = 'Erro ao conectar ao servidor.';
    }
  });

  // Setup
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target[0].value;
    const password = e.target[1].value;
    
    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        state.token = data.token;
        localStorage.setItem('sun_ia_token', data.token);
        showScreen('main');
      } else {
        loginError.innerText = data.error || 'Erro ao criar conta.';
      }
    } catch (err) {
      loginError.innerText = 'Erro ao conectar ao servidor.';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('sun_ia_token');
    state.token = null;
    location.reload();
  });

  // Chat
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = chatInput.scrollHeight + 'px';
  });
  
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Menu de Modos
  document.querySelectorAll('.nav-item[data-mode]').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.mode;
      switchMode(mode);
      if (window.innerWidth < 768) toggleMenu();
    });
  });
}

function toggleMenu() {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || state.isTyping) return;

  addMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  setTyping(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ message: text, mode: state.currentMode })
    });

    const data = await response.json();
    setTyping(false);

    if (response.ok) {
      addMessage('ai', data.reply);
    } else {
      addMessage('ai', 'Erro ao processar mensagem.');
    }
  } catch (err) {
    setTyping(false);
    addMessage('ai', 'Erro ao conectar ao servidor.');
  }
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerText = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setTyping(isTyping) {
  state.isTyping = isTyping;
  typingIndicator.classList.toggle('hidden', !isTyping);
}

function switchMode(mode) {
  state.currentMode = mode;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === mode);
  });
  
  chatMessages.innerHTML = '';
  const welcomeMessages = {
    chat: 'Olá! Eu sou o Sun IA. Como posso ajudar você hoje?',
    image: 'Modo de Imagem ativado. Descreva a imagem que você deseja gerar.',
    game: 'Modo de Jogos ativado. Que tipo de jogo você quer criar?',
    site: 'Modo de Sites ativado. Descreva o site que você precisa.'
  };
  addMessage('ai', welcomeMessages[mode]);
}
