const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório.' });
  }

  try {
    // Como o Gemini (através do SDK padrão) não gera imagens diretamente,
    // vamos simular a geração de imagem retornando uma URL de placeholder
    // e uma descrição detalhada da imagem gerada pela IA.
    // Em um cenário real, aqui seria feita a chamada para o Imagen 3 ou DALL-E.
    
    const result = await model.generateContent(`Descreva detalhadamente uma imagem baseada no prompt: "${prompt}". A descrição deve ser curta e inspiradora.`);
    const response = await result.response;
    const description = response.text();

    // Simulação de URL de imagem (usando Unsplash Source ou similar para demonstração visual)
    const imageUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop`;

    res.json({ 
      imageUrl: imageUrl, 
      description: description,
      message: "Nota: Esta é uma simulação visual. O Gemini 1.5 Flash gerou a descrição acima."
    });
  } catch (error) {
    console.error('Erro na Geração de Imagem:', error);
    res.status(500).json({ error: 'Erro ao gerar a imagem com a IA.' });
  }
});

module.exports = router;
