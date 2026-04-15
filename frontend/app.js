/**
 * Sun IA — Frontend Logic (Setup & Login Edition)
 */

// Estado Global
const state = {
  token: sessionStorage.getItem('sun_ia_token') || null,
  currentMode: 'home',
  chatHistory: []
};

// Elementos DOM
const loginScreen = document.getElementById('loginScreen');
const homeScreen = document.getElementById('homeScreen');
const setupForm = document.getElementById('setupForm');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
});

// Verifica se o sistema já tem administrador
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth/status');
    const data = await response.json();
    
    if (state.token) {
      showScreen('home');
    } else {
      showScreen('login');
      if (data.hasAdmin) {
        loginForm.classList.remove('hidden');
        setupForm.classList.add('hidden');
      } else {
        setupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      }
    }
  } catch (err) {
    loginError.innerText = 'Erro ao conectar ao servidor.';
  }
}

// Navegação
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId + 'Screen');
  if (target) target.classList.add('active');
  state.currentMode = screenId;
}

function goHome() {
  showScreen('home');
}

// Event Listeners
function setupEventListeners() {
  // Setup (Primeiro Acesso)
  setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('setupUser').value;
    const password = document.getElementById('setupPass').value;
    
    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        alert('Conta criada! Agora faça login.');
        window.location.reload();
      } else {
        loginError.innerText = data.message;
      }
    } catch (err) {
      loginError.innerText = 'Erro ao criar conta.';
    }
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        state.token = data.token;
        sessionStorage.setItem('sun_ia_token', data.token);
        showScreen('home');
      } else {
        loginError.innerText = data.message;
      }
    } catch (err) {
      loginError.innerText = 'Erro ao fazer login.';
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('sun_ia_token');
    window.location.reload();
  });

  // Cards de Modo
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      showScreen(mode);
    });
  });

  setupIAForms();
}

// Funções de IA (Chat, Imagem, etc.)
function setupIAForms() {
  // Chat
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const useSearch = document.getElementById('useSearch');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    chatInput.value = '';
    const loadingId = addMessage('ai', 'Processando...');

    try {
      const response = await protectedFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history: state.chatHistory, useSearch: useSearch.checked })
      });
      const data = await response.json();
      updateMessage(loadingId, data.reply);
      state.chatHistory.push({ role: 'user', parts: [{ text: message }] });
      state.chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
    } catch (err) {
      updateMessage(loadingId, 'Erro ao processar sua solicitação.');
    }
  });

  // Imagem
  const imageForm = document.getElementById('imageForm');
  const imagePrompt = document.getElementById('imagePrompt');
  const imageResult = document.getElementById('imageResult');

  imageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = imagePrompt.value.trim();
    if (!prompt) return;

    imageResult.innerHTML = '<p class="loading">Gerando imagem...</p>';

    try {
      const response = await protectedFetch('/api/image', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      imageResult.innerHTML = `
        <div class="image-display">
          <img src="${data.imageUrl}" alt="Gerada" style="width:100%; border:1px solid #1a1a1a;" />
          <p style="margin-top:15px; font-size:12px; color:#666;">${data.description}</p>
          <a href="${data.imageUrl}" download="sun-ia-image.png" class="code-btn" style="display:inline-block; margin-top:10px; text-decoration:none;">Baixar</a>
        </div>
      `;
    } catch (err) {
      imageResult.innerHTML = '<p class="error-msg">Erro ao gerar imagem.</p>';
    }
  });

  // Jogos e Sites
  ['game', 'site'].forEach(type => {
    const form = document.getElementById(`${type}Form`);
    const input = document.getElementById(`${type}Type`);
    const result = document.getElementById(`${type}Result`);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = input.value.trim();
      if (!prompt) return;

      result.innerHTML = `<p class="loading">Criando ${type}...</p>`;

      try {
        const response = await protectedFetch(`/api/${type}`, {
          method: 'POST',
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        displayCodeResult(result, data.code, prompt, type);
      } catch (err) {
        result.innerHTML = `<p class="error-msg">Erro ao gerar ${type}.</p>`;
      }
    });
  });
}

// Helpers
async function protectedFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': state.token,
    ...(options.headers || {})
  };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    sessionStorage.removeItem('sun_ia_token');
    window.location.reload();
  }
  return response;
}

function addMessage(role, text) {
  const id = Date.now();
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.id = `msg-${id}`;
  div.innerHTML = `<div class="message-bubble">${text}</div>`;
  document.getElementById('chatMessages').appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
  return id;
}

function updateMessage(id, text) {
  const msg = document.getElementById(`msg-${id}`);
  if (msg) {
    msg.querySelector('.message-bubble').innerText = text;
  }
}

function displayCodeResult(container, code, prompt, type) {
  const id = `frame-${Date.now()}`;
  container.innerHTML = `
    <div class="code-output">
      <iframe id="${id}" style="width:100%; height:400px; border:1px solid #1a1a1a; background:white;"></iframe>
      <div style="margin-top:15px; display:flex; gap:10px;">
        <button class="code-btn" onclick="downloadCode('${id}', '${type}')">Download</button>
        <button class="code-btn" onclick="deployCode('${id}', '${prompt}')">🚀 Publicar</button>
      </div>
    </div>
  `;
  const iframe = document.getElementById(id);
  iframe.srcdoc = code;
  iframe.dataset.code = code;
}

window.downloadCode = (id, type) => {
  const code = document.getElementById(id).dataset.code;
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sun-ia-${type}.html`;
  a.click();
};

window.deployCode = async (id, prompt) => {
  const code = document.getElementById(id).dataset.code;
  const btn = event.target;
  const originalText = btn.innerText;
  btn.innerText = 'Publicando...';
  btn.disabled = true;

  try {
    const response = await protectedFetch('/api/deploy', {
      method: 'POST',
      body: JSON.stringify({ code, projectName: prompt })
    });
    const data = await response.json();
    alert(`✅ Publicado com sucesso!\n\nURL: ${data.url}`);
    if (confirm('Deseja abrir o site agora?')) window.open(data.url, '_blank');
  } catch (err) {
    alert('Erro ao realizar deploy.');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
};
