const fetch = require('node-fetch');

/**
 * Serviço de Geração de Imagem (Real - Hugging Face Free)
 * Utiliza o modelo Stable Diffusion XL gratuitamente via Inference API.
 */
class ImageService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.modelUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
  }

  /**
   * Gera uma imagem baseada em um prompt
   * @param {string} prompt - Descrição da imagem
   * @returns {Promise<Object>} - Objeto com a imagem em Base64 e descrição
   */
  async generate(prompt) {
    if (!this.apiKey || this.apiKey.includes('xxxx')) {
      console.warn("[ImageService] HUGGINGFACE_API_KEY não configurada. Retornando mock.");
      return this.getMockResults(prompt);
    }

    console.log(`[ImageService] Gerando imagem real para: ${prompt}`);

    try {
      const response = await fetch(this.modelUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro na API do Hugging Face: ${error}`);
      }

      // A API retorna o binário da imagem (JPEG/PNG)
      const buffer = await response.buffer();
      const base64Image = buffer.toString('base64');

      return {
        imageUrl: `data:image/png;base64,${base64Image}`,
        description: `Imagem gerada para: "${prompt}"`,
        isReal: true
      };
    } catch (error) {
      console.error("[ImageService] Erro na geração real:", error);
      return this.getMockResults(prompt);
    }
  }

  /**
   * Fallback para resultados simulados
   */
  getMockResults(prompt) {
    return {
      imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop`,
      description: `[MODO DEMO] Imagem simulada para: "${prompt}". Configure sua HUGGINGFACE_API_KEY gratuita para gerar imagens reais.`,
      isReal: false
    };
  }
}

module.exports = new ImageService();
