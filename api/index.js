require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const aiController = require('./controllers/aiController');

const app = express();

// Estado em memória (Reinicia se a Vercel desligar a função, mas serve para o teste inicial)
// Para persistência real na Vercel, o usuário deve configurar as variáveis de ambiente.
let adminUser = {
  username: process.env.ADMIN_USERNAME || null,
  password: process.env.ADMIN_PASSWORD || null
};

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de Autenticação
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (adminUser.username && authHeader === `Bearer ${adminUser.username}:${adminUser.password}`) {
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
  }
};

// Rotas de API
app.get('/api/auth/status', (req, res) => {
  res.json({ hasAdmin: !!adminUser.username });
});

app.post('/api/setup', (req, res) => {
  const { username, password } = req.body;
  if (adminUser.username) {
    return res.status(403).json({ success: false, message: 'O sistema já possui um administrador.' });
  }
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
  }
  
  adminUser.username = username;
  adminUser.password = password;
  res.json({ success: true, token: `${username}:${password}` });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username && password === adminUser.password) {
    res.json({ success: true, token: `${username}:${password}` });
  } else {
    res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
  }
});

app.post('/api/chat', authMiddleware, (req, res) => aiController.chat(req, res));
app.post('/api/image', authMiddleware, (req, res) => aiController.generateImage(req, res));
app.post('/api/game', authMiddleware, (req, res) => {
  req.body.type = 'jogo';
  aiController.generateCode(req, res);
});
app.post('/api/site', authMiddleware, (req, res) => {
  req.body.type = 'site';
  aiController.generateCode(req, res);
});
app.post('/api/deploy', authMiddleware, (req, res) => aiController.deploy(req, res));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasAdmin: !!adminUser.username });
});

// Exportar para a Vercel
module.exports = app;
