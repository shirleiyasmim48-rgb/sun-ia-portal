# Sun IA — Sistema Privado

O **Sun IA** é um portal de inteligência artificial minimalista, elegante e privado. Ele oferece ferramentas de chat, geração de imagem, jogos e sites em um ambiente seguro e exclusivo, com um design sofisticado em preto e dourado.

---

## 🔐 Acesso Privado

O sistema é protegido por uma senha fixa. Sem a senha correta, o acesso às funcionalidades de IA é bloqueado tanto no frontend quanto no backend.

**Senha de Acesso:** `Achavedavidaéapaciencia.`

---

## ✨ Design & Estilo

- **Tema**: Minimalista Black & Gold (Preto e Dourado).
- **Fontes**: Cormorant Garamond (Elegante) e Montserrat (Moderna).
- **Interface**: Focada em simplicidade, sofisticação e foco no conteúdo.

---

## 🚀 Funcionalidades

1.  **💬 Chat IA**: Conversa inteligente com suporte a busca em tempo real.
2.  **🎨 IA de Imagem**: Geração de imagens reais via Stable Diffusion XL.
3.  **🎮 IA de Jogos**: Criação de jogos funcionais em HTML/JS puro.
4.  **🌐 IA de Sites**: Geração de landing pages e sites responsivos.
5.  **🚀 Deploy**: Publicação automática via GitHub e Vercel.

---

## 🛠️ Arquitetura do Projeto

```
ai-portal/
├── config/
│   └── systemPrompt.js # Comportamento base da IA
├── frontend/
│   ├── index.html      # Interface Sun IA (Login + App)
│   ├── styles.css      # Design Preto e Dourado
│   └── app.js          # Lógica de autenticação e API
├── backend/
│   ├── controllers/    # Orquestração (AIController)
│   ├── services/       # Integrações Reais (Gemini, Search, Image, Deploy)
│   ├── server.js       # Servidor Express com Auth Middleware
│   ├── .env            # Configurações e Senha
│   └── package.json    # Dependências
└── README.md
```

---

## ⚙️ Como Rodar o Projeto

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis (.env)
Crie um arquivo `.env` na pasta `backend/` com suas chaves:
```env
PORT=3000
SITE_PASSWORD=Achavedavidaéapaciencia.
GEMINI_API_KEY=SUA_CHAVE_AQUI
SERPAPI_KEY=SUA_CHAVE_AQUI
HUGGINGFACE_API_KEY=SUA_CHAVE_AQUI
GITHUB_TOKEN=SUA_CHAVE_AQUI
VERCEL_TOKEN=SUA_CHAVE_AQUI
```

### 3. Iniciar o Servidor
```bash
npm start
```

### 4. Acessar o Sun IA
Abra `http://localhost:3000` e insira a senha para entrar.

---

## 📄 Licença
MIT — Criado com elegância e tecnologia.
