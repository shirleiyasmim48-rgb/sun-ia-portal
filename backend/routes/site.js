const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/', async (req, res) => {
  const { siteType } = req.body;

  if (!siteType) {
    return res.status(400).json({ error: 'Tipo de site é obrigatório.' });
  }

  try {
    const prompt = `Crie um site moderno e responsivo em HTML, CSS e JavaScript puro baseado no tema: "${siteType}". 
    O código deve ser contido em um único arquivo HTML com as tags <style> e <script>. 
    O site deve ter um design profissional, escuro, com seções claras (Hero, Sobre, Serviços, Contato). 
    Retorne APENAS o código HTML completo, sem explicações adicionais ou blocos de código Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let code = response.text();

    // Limpeza básica de blocos de código Markdown se a IA os incluir
    code = code.replace(/```html/g, '').replace(/```/g, '').trim();

    res.json({ code: code });
  } catch (error) {
    console.error('Erro na Geração de Site:', error);
    res.status(500).json({ error: 'Erro ao gerar o site com a IA.' });
  }
});

module.exports = router;
