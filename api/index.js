require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiController = require('./controllers/aiController');

const app = express();

// Estado persistente via variáveis de ambiente ou memória temporária
let adminUser = {
  username: process.env.ADMIN_USERNAME || null,
  password: process.env.ADMIN_PASSWORD || null
};

app.use(cors());
app.use(express.json());

// Middleware de Autenticação Robusto
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : null;
  
  // Se o admin estiver definido (via setup ou env), validar o token
  if (adminUser.username && token === `${adminUser.username}:${adminUser.password}`) {
    return next();
  }
  
  res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
};

app.get('/api/auth/status', (req, res) => {
  res.json({ hasAdmin: !!adminUser.username });
});

app.post('/api/setup', (req, res) => {
  const { username, password } = req.body;
  if (adminUser.username) {
    return res.status(403).json({ success: false, message: 'Administrador já configurado.' });
  }
  adminUser.username = username;
  adminUser.password = password;
  res.json({ success: true, token: `${username}:${password}` });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (adminUser.username && username === adminUser.username && password === adminUser.password) {
    res.json({ success: true, token: `${username}:${password}` });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
  }
});

app.post('/api/chat', authMiddleware, (req, res) => aiController.chat(req, res));
app.post('/api/image', authMiddleware, (req, res) => aiController.generateImage(req, res));
app.post('/api/game', authMiddleware, (req, res) => { req.body.type = 'jogo'; aiController.generateCode(req, res); });
app.post('/api/site', authMiddleware, (req, res) => { req.body.type = 'site'; aiController.generateCode(req, res); });
app.post('/api/deploy', authMiddleware, (req, res) => aiController.deploy(req, res));

module.exports = app;
