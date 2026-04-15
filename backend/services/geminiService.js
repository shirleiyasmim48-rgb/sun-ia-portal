const { GoogleGenerativeAI } = require('@google/generative-ai');
const systemPrompt = require('../../config/systemPrompt');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && !this.apiKey.includes('xxxx')) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } else {
      console.warn("[GeminiService] Chave de API não configurada ou inválida. O serviço funcionará em modo de demonstração.");
      this.isDemo = true;
    }
  }

  async chat(message, history = []) {
    if (this.isDemo) {
      return `[MODO DEMO] Esta é uma resposta simulada para: "${message}". Configure uma GEMINI_API_KEY válida no arquivo .env para usar a IA real.`;
    }

    const chat = this.model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt.content }] },
        { role: "model", parts: [{ text: "Entendido. Serei seu assistente conforme as instruções." }] },
        ...history
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  }

  async generateCode(prompt, context = "site") {
    if (this.isDemo) {
      return `<!DOCTYPE html><html><body style="background:#121212;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;"><div><h1>${context.toUpperCase()} (MODO DEMO)</h1><p>Tema: ${prompt}</p><p>Configure sua API Key para gerar código real.</p></div></body></html>`;
    }

    const fullPrompt = `Crie um ${context} moderno e funcional em HTML, CSS e JS puro: "${prompt}". 
    Retorne APENAS o código HTML completo em um único arquivo, sem explicações ou Markdown.`;
    
    const result = await this.model.generateContent(fullPrompt);
    const response = await result.response;
    let code = response.text();
    return code.replace(/```html/g, '').replace(/```/g, '').trim();
  }
}

module.exports = new GeminiService();
