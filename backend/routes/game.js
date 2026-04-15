const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/', async (req, res) => {
  const { gameType } = req.body;

  if (!gameType) {
    return res.status(400).json({ error: 'Tipo de jogo é obrigatório.' });
  }

  try {
    const prompt = `Crie um jogo simples em HTML, CSS e JavaScript puro baseado no tema: "${gameType}". 
    O código deve ser contido em um único arquivo HTML com as tags <style> e <script>. 
    O jogo deve ser funcional, ter um design moderno e escuro, e ser fácil de jogar. 
    Retorne APENAS o código HTML completo, sem explicações adicionais ou blocos de código Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let code = response.text();

    // Limpeza básica de blocos de código Markdown se a IA os incluir
    code = code.replace(/```html/g, '').replace(/```/g, '').trim();

    res.json({ code: code });
  } catch (error) {
    console.error('Erro na Geração de Jogo:', error);
    res.status(500).json({ error: 'Erro ao gerar o jogo com a IA.' });
  }
});

module.exports = router;
