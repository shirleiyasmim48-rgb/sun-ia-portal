const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const systemPrompt = require('../../config/systemPrompt');

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória.' });
  }

  try {
    // Inicia o chat com o histórico e o prompt do sistema
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt.content }] },
        { role: "model", parts: [{ text: "Entendido. Serei seu assistente conforme as instruções." }] },
        ...(history || [])
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Erro no Chat Gemini:', error);
    res.status(500).json({ error: 'Erro ao processar sua mensagem com a IA.' });
  }
});

module.exports = router;
