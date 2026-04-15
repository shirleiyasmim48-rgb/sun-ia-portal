require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const aiController = require('./controllers/aiController');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_PASSWORD = process.env.SITE_PASSWORD || "Achavedavidaéapaciencia.";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Middleware de Autenticação Simples
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader === SITE_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Não autorizado. Senha incorreta.' });
  }
};

// Rota de Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === SITE_PASSWORD) {
    res.json({ success: true, token: SITE_PASSWORD });
  } else {
    res.status(401).json({ success: false, message: 'Senha incorreta.' });
  }
});

// Rotas da API Protegidas
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

// Rota de Saúde (Health Check)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota Fallback para o Frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Exportar o app para a Vercel (Serverless)
module.exports = app;

// Inicialização local (apenas se não estiver na Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`
    =========================================
    Sun IA — Sistema Privado
    Porta: ${PORT}
    Status: Autenticação Ativa
    =========================================
    `);
  });
}
