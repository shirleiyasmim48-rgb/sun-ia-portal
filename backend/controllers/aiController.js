const geminiService = require('../services/geminiService');
const searchService = require('../services/searchService');
const imageService = require('../services/imageService');
const deployService = require('../services/deployService');

class AIController {
  /**
   * Lógica de Chat com suporte a busca em tempo real REAL
   */
  async chat(req, res) {
    const { message, history, useSearch } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

    try {
      let context = "";
      
      // Se o usuário solicitar busca em tempo real
      if (useSearch) {
        console.log(`[AIController] Iniciando busca real para: ${message}`);
        const searchResults = await searchService.search(message);
        
        // Formata os resultados de busca para a IA de forma estruturada
        context = `\n\n[RESULTADOS DE BUSCA EM TEMPO REAL]:\n`;
        searchResults.forEach((res, index) => {
          context += `${index + 1}. Título: ${res.title}\n   Snippet: ${res.snippet}\n   Link: ${res.link}\n\n`;
        });
        
        context += `\nInstrução: Use os resultados acima para responder de forma atualizada e precisa. Cite fontes se necessário.`;
      }

      // Envia a mensagem original + o contexto de busca para o Gemini
      const reply = await geminiService.chat(message + context, history);
      res.json({ reply });
    } catch (error) {
      console.error('[AIController] Erro no Chat:', error);
      res.status(500).json({ error: 'Erro ao processar chat com busca real.' });
    }
  }

  /**
   * Lógica de Geração de Imagem via ImageService
   */
  async generateImage(req, res) {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt é obrigatório.' });

    try {
      const result = await imageService.generate(prompt);
      res.json(result);
    } catch (error) {
      console.error('[AIController] Erro na Imagem:', error);
      res.status(500).json({ error: 'Erro ao gerar imagem.' });
    }
  }

  /**
   * Lógica de Geração de Código (Jogos/Sites) via GeminiService
   */
  async generateCode(req, res) {
    const { prompt, type } = req.body; // type: 'jogo' ou 'site'
    if (!prompt) return res.status(400).json({ error: 'Prompt é obrigatório.' });

    try {
      const code = await geminiService.generateCode(prompt, type);
      res.json({ code });
    } catch (error) {
      console.error('[AIController] Erro no Código:', error);
      res.status(500).json({ error: 'Erro ao gerar código.' });
    }
  }

  /**
   * Lógica de Deploy via DeployService
   */
  async deploy(req, res) {
    const { code, projectName } = req.body;
    if (!code || !projectName) return res.status(400).json({ error: 'Código e nome do projeto são obrigatórios.' });

    try {
      const result = await deployService.deploy(code, projectName);
      res.json(result);
    } catch (error) {
      console.error('[AIController] Erro no Deploy:', error);
      res.status(500).json({ error: 'Erro ao realizar deploy.' });
    }
  }
}

module.exports = new AIController();
