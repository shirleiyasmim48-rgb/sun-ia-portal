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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar tela de login por padrão imediatamente
  showScreen('login');
  
  // Tentar verificar o status do admin em segundo plano
  checkAuthStatus();
  
  // Se já tiver token, tentar entrar direto
  if (state.token) {
    showScreen('home');
  }
  
  setupEventListeners();
});

// Verifica se o sistema já tem administrador
async function checkAuthStatus() {
  try {
    // Usar caminho relativo para a Vercel
    const response = await fetch('/api/auth/status');
    if (!response.ok) throw new Error('Erro na resposta');
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
    // Se falhar, mostramos o login por padrão para não travar a tela
    loginForm.classList.remove('hidden');
    setupForm.classList.add('hidden');
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
        showScreen('home');
      } else {
        loginError.innerText = data.error || 'Erro ao entrar.';
      }
    } catch (err) {
      loginError.innerText = 'Erro ao conectar ao servidor.';
    }
  });

  // Setup (Primeiro Registro)
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
        showScreen('home');
      } else {
        loginError.innerText = data.error || 'Erro ao criar conta.';
      }
    } catch (err) {
      loginError.innerText = 'Erro ao conectar ao servidor.';
    }
  });

  // Chat
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Menu de Modos
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.mode;
      if (mode) switchMode(mode);
    });
  });
}

// Lógica de Chat
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || state.isTyping) return;

  addMessage('user', text);
  chatInput.value = '';
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
      addMessage('ai', 'Erro ao processar mensagem. Verifique sua conexão.');
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
  typingIndicator.style.display = isTyping ? 'block' : 'none';
}

function switchMode(mode) {
  state.currentMode = mode;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.mode === mode);
  });
  
  // Limpar chat ao trocar de modo
  chatMessages.innerHTML = '';
  addMessage('ai', `Modo ${mode.toUpperCase()} ativado. Como posso ajudar?`);
}
